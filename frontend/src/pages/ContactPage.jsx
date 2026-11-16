import React, { useState } from 'react';
import SvgIcon from '../components/SvgIcon';
import { useNotifications } from '../context/NotificationContext';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useNotifications();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been received. Thank you!', 'success');
  };

  return (
    <div className="container" style={{ padding: '48px 20px 80px', maxWidth: '720px' }}>
      <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
        Support and Feedback
      </div>
      <h1 style={{ marginBottom: '12px' }}>Contact PriceTrack</h1>
      <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
        Have questions about price monitoring, store adapters, or academic evaluation? Get in touch with our team.
      </p>

      {submitted ? (
        <div className="card alert-box-success" style={{ padding: '32px', textAlign: 'center' }}>
          <SvgIcon name="check" size={32} color="var(--color-success)" />
          <h3 style={{ fontSize: '18px', marginTop: '12px', marginBottom: '8px' }}>Message Received</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text)' }}>
            Thank you for reaching out. A team representative will review your inquiry shortly.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="contactName">Your Name</label>
              <input
                id="contactName"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suresh Kumar"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactEmail">Email Address</label>
              <input
                id="contactEmail"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactSubject">Subject</label>
              <input
                id="contactSubject"
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding store adapter integration"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactMessage">Message</label>
              <textarea
                id="contactMessage"
                className="form-textarea"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details of your question or feedback..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full">
              Send Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
