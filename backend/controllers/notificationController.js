const { ObjectId } = require('mongodb');
const Notifications = require('../models/notifications');

const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const notifications = await Notifications.findByUserId(req.user._id);
      const unreadCount = await Notifications.countUnread(req.user._id);

      return res.json({
        success: true,
        unreadCount,
        notifications
      });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID.'
        });
      }

      await Notifications.markAsRead(id, req.user._id);
      const unreadCount = await Notifications.countUnread(req.user._id);

      return res.json({
        success: true,
        message: 'Notification marked as read.',
        unreadCount
      });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req, res, next) {
    try {
      await Notifications.markAllAsRead(req.user._id);

      return res.json({
        success: true,
        message: 'All notifications marked as read.',
        unreadCount: 0
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification ID.'
        });
      }

      const success = await Notifications.delete(id, req.user._id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found.'
        });
      }

      const unreadCount = await Notifications.countUnread(req.user._id);
      return res.json({
        success: true,
        message: 'Notification removed.',
        unreadCount
      });
    } catch (err) {
      next(err);
    }
  },

  async clearAll(req, res, next) {
    try {
      await Notifications.clearAll(req.user._id);
      return res.json({
        success: true,
        message: 'All notifications cleared.',
        unreadCount: 0
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
