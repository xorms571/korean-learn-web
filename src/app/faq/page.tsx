'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        {isOpen ? (
          <FiChevronUp className="h-6 w-6 text-blue-600" />
        ) : (
          <FiChevronDown className="h-6 w-6 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FaqPage() {
  const faqs = [
    {
      question: 'How is my level calculated?',
      answer: 'Your level is determined by your progress in the courses. For each level (e.g., Beginner), your sub-level increases based on the percentage of courses you complete. Once you complete 100% of the courses for a level, you will advance to the next level (e.g., from Beginner 9 to Intermediate 0).',
    },
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by going to the login page and clicking the "Forgot Password" link. Follow the instructions sent to your email to set a new password.',
    },
    {
      question: 'How can I track my progress?',
      answer: 'You can see your progress for each course on the Courses page. Each course card displays your current completion percentage. You can also visit your Dashboard to see a more detailed overview of your learning activity and achievements.',
    },
    {
        question: 'Can I retake a course I have already completed?',
        answer: 'Yes, you can review any completed course at any time. Simply click the "Review Course" button on the course card on the Courses page. Your previous progress and completion status will be saved.',
    },
    {
        question: 'Are the courses free?',
        answer: 'Yes, all courses on our platform are currently free to access. You can start learning right away without any payment.',
    },
    {
        question: 'How do I change my profile picture or display name?',
        answer: 'You can update your profile information on your Profile page. Click on your name or avatar in the header to navigate to your profile, where you can edit your details.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-2 text-lg text-gray-600">
            Find quick answers to common questions.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {faqs.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
