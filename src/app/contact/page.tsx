'use client';

import { useState } from 'react';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Sending...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('Thank you for your message! We will get back to you shortly.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus(`An error occurred: ${result.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FiMail className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-lg text-gray-600">
            We'd love to hear from you. Please fill out the form below or reach out to us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {status && (
                <p className={`text-center ${status.includes('error') ? 'text-red-600' : 'text-green-600'}`}>{status}</p>
              )}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Information</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-center">
                  <FiPhone className="h-5 w-5 text-blue-600 mr-3" />
                  <span>+1 (123) 456-7890</span>
                </div>
                <div className="flex items-center">
                  <FiMail className="h-5 w-5 text-blue-600 mr-3" />
                  <span>xorms6865@naver.com</span>
                </div>
                <div className="flex items-start">
                  <FiMapPin className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <span>123 Sejong Street, Jongno-gu, Seoul, South Korea</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
