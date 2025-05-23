import { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us - AI Humanizer",
  description: "Get in touch with our team for support or inquiries about AI Humanizer.",
};

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-24 max-w-7xl mx-auto">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Have questions or need assistance? Our team is here to help. Fill out the form or contact us directly using the information below.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4A90E2] text-white">
                  <Mail className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Email</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  <a href="mailto:support@aihumanizer.com" className="hover:text-[#4A90E2]">
                    support@aihumanizer.com
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4A90E2] text-white">
                  <Phone className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Phone</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  <a href="tel:+18005551234" className="hover:text-[#4A90E2]">
                    +1 (800) 555-1234
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4A90E2] text-white">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Office</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  123 AI Boulevard<br />
                  San Francisco, CA 94107<br />
                  United States
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-lg font-medium mb-4">Business Hours</h3>
            <dl className="space-y-2 text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <dt>Monday - Friday:</dt>
                <dd>9:00 AM - 6:00 PM (PST)</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saturday:</dt>
                <dd>10:00 AM - 4:00 PM (PST)</dd>
              </div>
              <div className="flex justify-between">
                <dt>Sunday:</dt>
                <dd>Closed</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}