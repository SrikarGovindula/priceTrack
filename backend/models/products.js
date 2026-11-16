const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const Products = {
  col() {
    return getDB().collection('products');
  },

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return this.col().findOne({ _id: new ObjectId(id) });
  },

  async search({ query = '', category = '', brand = '', minPrice, maxPrice, sortBy = 'popularity', page = 1, limit = 12 }) {
    const filter = {};

    if (query && query.trim()) {
      const q = query.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { modelNumber: { $regex: q, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (brand && brand !== 'All') {
      filter.brand = { $regex: `^${brand}$`, $options: 'i' };
    }

    // Join with store listings to get current lowest price, store count, etc.
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'storeListings',
          localField: '_id',
          foreignField: 'productId',
          as: 'listings'
        }
      },
      {
        $addFields: {
          lowestPrice: { $min: '$listings.currentPrice' },
          highestPrice: { $max: '$listings.currentPrice' },
          originalPrice: { $max: '$listings.originalPrice' },
          storeCount: { $size: '$listings' },
          discountPercent: {
            $cond: [
              { $and: [{ $gt: [{ $max: '$listings.originalPrice' }, 0] }, { $gt: [{ $min: '$listings.currentPrice' }, 0] }] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: [{ $max: '$listings.originalPrice' }, { $min: '$listings.currentPrice' }] },
                          { $max: '$listings.originalPrice' }
                        ]
                      },
                      100
                    ]
                  },
                  0
                ]
              },
              0
            ]
          }
        }
      }
    ];

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && !isNaN(minPrice)) priceFilter.$gte = Number(minPrice);
      if (maxPrice !== undefined && !isNaN(maxPrice)) priceFilter.$lte = Number(maxPrice);
      if (Object.keys(priceFilter).length > 0) {
        pipeline.push({ $match: { lowestPrice: priceFilter } });
      }
    }

    // Sorting
    let sortStage = { $sort: { createdAt: -1 } };
    if (sortBy === 'price_asc') {
      sortStage = { $sort: { lowestPrice: 1 } };
    } else if (sortBy === 'price_desc') {
      sortStage = { $sort: { lowestPrice: -1 } };
    } else if (sortBy === 'discount') {
      sortStage = { $sort: { discountPercent: -1 } };
    } else if (sortBy === 'newest') {
      sortStage = { $sort: { createdAt: -1 } };
    } else if (sortBy === 'name') {
      sortStage = { $sort: { name: 1 } };
    }
    pipeline.push(sortStage);

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.col().aggregate(countPipeline).toArray();
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Apply pagination
    const skip = (Math.max(1, page) - 1) * limit;
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Project fields
    pipeline.push({
      $project: {
        listings: 0 // Keep response lightweight
      }
    });

    const products = await this.col().aggregate(pipeline).toArray();

    return {
      products,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  async getSuggestions(query, limit = 6) {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim();
    return this.col().find(
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ]
      },
      { projection: { name: 1, brand: 1, category: 1, image: 1 } }
    ).limit(limit).toArray();
  },

  async getCategories() {
    return this.col().distinct('category');
  },

  async getBrands() {
    return this.col().distinct('brand');
  },

  async create({ name, brand, category, description, image, modelNumber, specifications = {} }) {
    const doc = {
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      description: description || '',
      image: image || '',
      modelNumber: modelNumber || '',
      specifications: specifications || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.col().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  async update(id, updates) {
    if (!ObjectId.isValid(id)) return null;
    updates.updatedAt = new Date();
    await this.col().updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return this.findById(id);
  },

  async delete(id) {
    if (!ObjectId.isValid(id)) return false;
    const res = await this.col().deleteOne({ _id: new ObjectId(id) });
    return res.deletedCount > 0;
  },

  async count() {
    return this.col().countDocuments();
  }
};

module.exports = Products;
