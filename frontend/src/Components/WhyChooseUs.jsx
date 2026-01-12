import React from 'react';
import { Star, MessageCircle, Award, Shield } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: Star,
      title: "Trusted Service",
      description: "Thousands of travellers rely on WorldClass for safe and smooth journeys."
    },
    {
      icon: MessageCircle,
      title: "Expert Guidance",
      description: "Travel specialists to help you choose the right destination and plan."
    },
    {
      icon: Award,
      title: "Affordable Packages",
      description: "Premium travel experiences at the best guaranteed prices."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Safe payments and verified travel partners you can trust."
    }
  ];

  return (
    <div className="bg-gray-50 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-16">
          Why Choose Us
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-blue-700" strokeWidth={2} />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}