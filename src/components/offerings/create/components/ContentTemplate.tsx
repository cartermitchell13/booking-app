import React from 'react';
import { FileText, Lightbulb, Copy } from 'lucide-react';

interface ContentTemplateProps {
  onUseTemplate: (template: string) => void;
}

export const ContentTemplate: React.FC<ContentTemplateProps> = ({ onUseTemplate }) => {
  const templates = [
    {
      id: 'adventure-tour',
      name: 'Adventure Tour',
      description: 'Perfect for outdoor adventures and hiking tours',
      content: `## 🌟 What Makes This Experience Special
• Breathtaking panoramic views from the summit
• Small group size (max 8 people) for personalized attention
• Expert local guide with 10+ years experience
• Hidden gems only locals know about

## ✅ What's Included
• Professional hiking equipment and safety gear
• Transportation from downtown meeting point
• Light snacks and water throughout the tour
• Professional photos of your group
• Detailed trail maps and information booklet

## ❌ What's NOT Included
• Lunch (available for purchase at summit café)
• Personal hiking boots (rental available for $15)
• Travel insurance
• Gratuities for guide (optional)

## 📋 What to Bring & Requirements
• Comfortable hiking shoes with good grip
• Weather-appropriate clothing (layers recommended)
• Basic fitness level required - moderate hiking involved
• Minimum age: 12 years old
• Maximum weight limit: 250 lbs for safety equipment`
    },
    {
      id: 'cultural-experience',
      name: 'Cultural Experience',
      description: 'Great for cultural tours and local experiences',
      content: `## 🏛️ Immerse Yourself in Local Culture
• Authentic local experiences away from tourist crowds
• Stories and legends passed down through generations
• Hands-on activities with local artisans
• Taste traditional foods and beverages

## ✅ What's Included
• Expert cultural guide and storyteller
• All entrance fees to historical sites
• Traditional craft workshop participation
• Local food tasting experience
• Cultural souvenir to take home

## ❌ What's NOT Included
• Full meals (light snacks provided)
• Additional shopping purchases
• Transportation to meeting point
• Personal expenses

## 📋 Important Information
• Comfortable walking shoes recommended
• Respectful dress code required for cultural sites
• Basic English proficiency helpful but not required
• Suitable for all ages and fitness levels
• Duration includes breaks and photo opportunities`
    },
    {
      id: 'family-friendly',
      name: 'Family Activity',
      description: 'Ideal for family-friendly activities and tours',
      content: `## 👨‍👩‍👧‍👦 Perfect Family Adventure
• Designed specifically for families with children
• Interactive activities to keep kids engaged
• Educational and fun for all ages
• Safe, supervised environment throughout

## ✅ What's Included
• Family-friendly professional guide
• All activity equipment sized for children and adults
• Safety briefing and equipment fitting
• Snacks and refreshments for the whole family
• Family photo session with scenic backdrop

## ❌ What's NOT Included
• Meals (family restaurant recommendations provided)
• Stroller rental (available on-site)
• Baby changing facilities (available at visitor center)
• Additional activities not listed in itinerary

## 📋 Family Guidelines
• Children must be accompanied by an adult at all times
• Recommended for ages 5 and up
• Stroller-accessible paths available
• Nursing/changing areas available
• No fitness requirements - suitable for all family members`
    }
  ];

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-semibold text-blue-900">Content Templates</h3>
      </div>
      
      <p className="text-blue-700 text-sm mb-4">
        Get started quickly with these proven templates. Click "Use Template" to load content, then customize it for your offering.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-blue-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{template.description}</p>
              </div>
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => onUseTemplate(template.content)}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Use Template
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(template.content)}
                className="px-2 py-1.5 border border-blue-300 text-blue-600 text-xs rounded hover:bg-blue-50 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
        <h4 className="font-medium text-gray-900 text-sm mb-2">💡 Pro Tips for Great Content</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use emojis and headers to make content scannable</li>
          <li>• Be specific about what's included vs. what costs extra</li>
          <li>• Mention any physical requirements or age restrictions</li>
          <li>• Include unique selling points that set you apart</li>
          <li>• Use bullet points for easy reading</li>
        </ul>
      </div>
    </div>
  );
};
