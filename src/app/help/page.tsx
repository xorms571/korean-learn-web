'use client';

import { FiHelpCircle, FiMail, FiMessageSquare } from 'react-icons/fi';

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by going to the login page and clicking the "Forgot Password" link. Follow the instructions sent to your email to set a new password.',
    },
    {
      question: 'How is my level calculated?',
      answer: 'Your level is determined by your progress in the courses. For each level (e.g., Beginner), your sub-level increases based on the percentage of courses you complete. Once you complete 100% of the courses for a level, you will advance to the next level.',
    },
    {
      question: 'How can I track my progress?',
      answer: 'You can see your progress for each course on the Courses page. Each course card displays your current completion percentage. You can also visit your Dashboard to see an overview of your learning activity.',
    },
    {
        question: 'Can I retake a course I have already completed?',
        answer: 'Yes, you can review any completed course at any time. Simply click the "Review Course" button on the course card.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FiHelpCircle className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find answers to your questions and get the help you need.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="font-semibold text-lg text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiMail className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
                <p className="mt-1 text-gray-600">Get in touch with our support team for any issue.</p>
                <a href="mailto:xorms6865@naver.com" className="mt-2 inline-block text-blue-600 hover:text-blue-700 font-semibold">
                  xorms6865@naver.com
                </a>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiMessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Community Forum</h3>
                <p className="mt-1 text-gray-600">Ask questions and share tips with other learners.</p>
                <a href="/community" className="mt-2 inline-block text-blue-600 hover:text-blue-700 font-semibold">
                  Go to Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
