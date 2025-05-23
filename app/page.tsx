"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, SparklesIcon, ZapIcon, ShieldIcon, LineChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextEditor from "@/components/common/text-editor";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const { scrollY } = useScroll();
  const [isEditorVisible, setIsEditorVisible] = useState(false);

  // Parallax and fade effects
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const titleTranslateY = useTransform(scrollY, [0, 200], [0, -50]);
  const editorScale = useTransform(scrollY, [0, 200], [0.95, 1]);

  // Intersection observers for fade-in sections
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [howItWorksRef, howItWorksInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [testimonialsRef, testimonialsInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsEditorVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-b from-[#F5F7FA] to-white dark:from-gray-900 dark:to-gray-800">
        <motion.div
          style={{ opacity: titleOpacity, y: titleTranslateY }}
          className="container px-4 md:px-6 mx-auto max-w-7xl pt-32 md:pt-40 text-center"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6">
            Make AI Text Sound{" "}
            <span className="text-[#4A90E2]">Human</span>
          </h1>
          <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 mb-8">
            Transform robotic AI-generated content into natural, human-like text that connects with your audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-[#4A90E2] hover:bg-[#3A80D2] text-lg"
              onClick={() => {
                const editor = document.getElementById("editor-section");
                editor?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Try for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          style={{ scale: editorScale }}
          className={cn(
            "container px-4 md:px-6 mx-auto max-w-7xl transition-all duration-500",
            isEditorVisible ? "opacity-100" : "opacity-0"
          )}
          id="editor-section"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
            <TextEditor />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0, y: 50 }}
        animate={featuresInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white dark:bg-gray-900"
      >
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why Choose AI Humanizer?
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Our advanced AI technology transforms machine-generated text into natural, engaging content that resonates with human readers.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
              <div className="rounded-full bg-[#4A90E2]/10 p-4 mb-4">
                <SparklesIcon className="h-8 w-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Natural Language</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Transform robotic text into fluid, conversational language that sounds authentically human.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
              <div className="rounded-full bg-[#4A90E2]/10 p-4 mb-4">
                <ZapIcon className="h-8 w-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Results</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Get humanized content in seconds, not minutes or hours. Perfect for tight deadlines.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
              <div className="rounded-full bg-[#4A90E2]/10 p-4 mb-4">
                <ShieldIcon className="h-8 w-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Privacy Focused</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your content remains private and secure. We never store or use your text for training.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
              <div className="rounded-full bg-[#4A90E2]/10 p-4 mb-4">
                <LineChartIcon className="h-8 w-8 text-[#4A90E2]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tone Control</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Adjust the tone to match your brand voice, from professional to casual or friendly.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        ref={howItWorksRef}
        initial={{ opacity: 0, y: 50 }}
        animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-24 bg-[#F5F7FA] dark:bg-gray-800"
      >
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Our AI-powered platform makes it easy to transform robotic text into natural, human-like content in just a few steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                <h3 className="text-xl font-bold mt-4 mb-2">Paste Your Text</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start by pasting your AI-generated text into our editor. We accept content of any length or topic.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <h3 className="text-xl font-bold mt-4 mb-2">Select Your Tone</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose from professional, casual, or friendly tones to match your audience and brand voice.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                <h3 className="text-xl font-bold mt-4 mb-2">Get Humanized Text</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our AI instantly transforms your text, making it sound natural and human-written while preserving your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        ref={testimonialsRef}
        initial={{ opacity: 0, y: 50 }}
        animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white dark:bg-gray-900"
      >
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed their content with AI Humanizer.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Image
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold">Michael Thompson</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "AI Humanizer has transformed our content strategy. What used to take hours of manual editing now happens instantly. Our engagement metrics have improved dramatically."
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Image
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Content Creator</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "I was skeptical at first, but AI Humanizer has become my secret weapon. My readers can't tell the difference between my writing and the AI-assisted content."
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Image
                  src="https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold">David Chen</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">SEO Specialist</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The Pro plan has been a game-changer for our agency. We're producing more content than ever while maintaining a consistent, human-like voice across all our clients."
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-24 bg-[#4A90E2] text-white">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Humanize Your Content?
              </h2>
              <p className="mt-4 text-lg opacity-90 max-w-xl">
                Start transforming your AI-generated text into engaging, human-like content today. No credit card required to get started.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Button asChild size="lg" variant="default" className="bg-white text-[#4A90E2] hover:bg-gray-100">
                <Link href="/dashboard">
                  Try for Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}