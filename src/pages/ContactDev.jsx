import React from 'react';
import { Mail, Phone, MapPin, Wrench } from 'lucide-react';

const ContactDev = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#B84937] to-[#7A2B22] text-white p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Wrench className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Website Temporarily Closed</h1>
            <p className="text-xl sm:text-2xl text-white/90">
              We're currently under maintenance
            </p>
          </div>

          {/* Content Section */}
          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                We apologize for the inconvenience. Our website is currently closed for maintenance and updates.
                We're working hard to improve your experience and will be back online soon.
              </p>
              <p className="text-gray-700 font-semibold text-xl mb-8">
                For any urgent inquiries, please contact us using the information below:
              </p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 text-lg">Call Us</h3>
                <p className="text-gray-600 text-sm sm:text-base">+63 09202297698</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 text-lg">Email Us</h3>
                <p className="text-gray-600 text-sm sm:text-base break-words">ninoreygarbo13@gmail.com</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B84937] to-[#9E3C2D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 text-lg">Visit Us</h3>
                <p className="text-gray-600 text-sm sm:text-base">Purok Kawayan 6, Tayud Liloan Cebu</p>
              </div>
            </div>

            {/* Footer Message */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Contact Developer: Niño Rey Garbo to Reopen the website
              </p>
              <p className="text-gray-600 text-sm sm:text-base">+63 09202297698</p>
              <p className="text-gray-600 text-sm sm:text-base">ninoreygarbo13@gmail.com</p>
              <p className="text-gray-600 text-sm sm:text-base">Purok Kawayan 6, Tayud Liloan Cebu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDev;

