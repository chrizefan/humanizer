"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, SparklesIcon, ZapIcon, ShieldIcon, LineChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextEditor from "@/components/common/text-editor";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useSpring, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const { scrollY } = useScroll();
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [hasAutoJumped, setHasAutoJumped] = useState(false);

  // Parallax and fade effects with spring physics for smoother animations
  const titleOpacitySpring = useSpring(useTransform(scrollY, [0, 350], [1, 0]), { stiffness: 100, damping: 30 });
  const titleTranslateYSpring = useSpring(useTransform(scrollY, [0, 350], [0, -100]), { stiffness: 100, damping: 30 });
  const editorOpacitySpring = useSpring(useTransform(scrollY, [200, 400], [0, 1]), { stiffness: 100, damping: 30 });
  const editorScaleSpring = useSpring(useTransform(scrollY, [200, 450], [0.92, 1]), { stiffness: 100, damping: 30 });
  
  // Enhanced 3D rotation effects based on scroll position
  const editorRotateXSpring = useSpring(useTransform(scrollY, [250, 500], [5, 0]), { stiffness: 100, damping: 25 });
  const editorRotateYSpring = useSpring(useTransform(scrollY, [250, 500], [-3, 0]), { stiffness: 100, damping: 25 });
  const editorTranslateZSpring = useSpring(useTransform(scrollY, [250, 500], [-50, 0]), { stiffness: 100, damping: 25 });

  // Intersection observers for fade-in sections with better thresholds
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: false,
    threshold: 0.25,
    rootMargin: "-30px 0px",
  });

  const [howItWorksRef, howItWorksInView] = useInView({
    triggerOnce: false,
    threshold: 0.15,
    rootMargin: "-100px 0px",
  });

  const [testimonialsRef, testimonialsInView] = useInView({
    triggerOnce: false,
    threshold: 0.15,
    rootMargin: "-50px 0px",
  });
  
  const [ctaRef, ctaInView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: "-50px 0px",
  });
  
  // Additional references for enhanced 3D scroll effects
  const [step1Ref, step1InView] = useInView({ threshold: 0.5, triggerOnce: false });
  const [step2Ref, step2InView] = useInView({ threshold: 0.5, triggerOnce: false });
  const [step3Ref, step3InView] = useInView({ threshold: 0.5, triggerOnce: false });
  
  // Create animation controls for sequenced animations
  const featureControls = useAnimation();
  const testimonialControls = useAnimation();
  
  // Update animation controls when sections come into view
  useEffect(() => {
    /* Feature animations now handled directly in the component */
    
    if (testimonialsInView) {
      testimonialControls.start("visible");
    } else {
      testimonialControls.start("hidden");
    }
  }, [testimonialsInView, testimonialControls]);
  
  // Animation variants for staggered animations
  const featureVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: i * 0.15,
      }
    })
  };
  
  const testimonialVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay: i * 0.2,
      }
    })
  };

  // Hero section styles and animations
  const heroStyle = {
    opacity: titleOpacitySpring,
    y: titleTranslateYSpring,
  };
  
  // Editor section styles and animations with 3D perspective
  const editorStyle = {
    opacity: editorOpacitySpring,
    scale: editorScaleSpring,
    rotateX: editorRotateXSpring,
    rotateY: editorRotateYSpring,
    z: editorTranslateZSpring,
    transformPerspective: 1000,
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsEditorVisible(window.scrollY > window.innerHeight * 0.4);
      
      // If user starts scrolling slightly, automatically jump to the editor section
      if (!hasAutoJumped && window.scrollY > 100 && window.scrollY < window.innerHeight * 0.3) {
        // Only auto-jump if they're in this "in-between" zone and haven't jumped yet
        setHasAutoJumped(true); // Set flag to prevent repeated jumps
        
        const editorSection = document.getElementById("editor-section");
        if (editorSection) {
          // Perfectly center the editor in the viewport
          const elementPosition = editorSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - (window.innerHeight / 2) + (editorSection.offsetHeight / 4);
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
      
      // Reset the auto-jump flag if user scrolls back to top
      if (window.scrollY < 50) {
        setHasAutoJumped(false);
      }
    };

    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAutoJumped]);

  return (
    <>
      {/* Hero Section - Full Screen */}
      <section className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F7FA] to-white dark:from-gray-900 dark:to-gray-800 pt-16">
        <motion.div
          style={heroStyle}
          className="container px-4 md:px-6 mx-auto w-full text-center"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
            Make AI Text Sound{" "}
            <span className="text-[#4A90E2]">Human</span>
          </h1>
          <p className="max-w-[800px] mx-auto text-gray-500 md:text-2xl/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed dark:text-gray-400 mb-10">
            Transform robotic AI-generated content into natural, human-like text that connects with your audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-[#4A90E2] hover:bg-[#3A80D2] text-lg px-8 py-6 h-auto"
              onClick={() => {
                const editorSection = document.getElementById("editor-section");
                if (editorSection) {
                  // Perfectly center the editor in the viewport
                  const elementPosition = editorSection.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - (window.innerHeight / 2) + (editorSection.offsetHeight / 4);
                  
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                  });
                }
              }}
            >
              Try for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8 py-6 h-auto">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="text-gray-400 animate-bounce mt-10">
            <span className="inline-block">Scroll Down</span> 
            <ArrowRight className="h-4 w-4 ml-2 inline rotate-90" />
          </p>
        </motion.div>
      </section>

      {/* Spacer to allow scrolling */}
      <div className="h-[120vh] w-full"></div>

      {/* Editor Section that appears as user scrolls */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4f9] via-white to-[#e8f0fe] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative z-20 px-4 md:px-8 py-16">
        <motion.div
          style={editorStyle}
          className="container mx-auto max-w-[1800px] w-full"
          id="editor-section"
        >
          <div className="bg-white/85 dark:bg-gray-900/85 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 lg:p-16 border border-gray-100 dark:border-gray-800">
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
        className="py-24 bg-white dark:bg-gray-900 relative z-30"
      >
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={featuresInView ? { 
              opacity: 1,
              transition: {
                duration: 0.8,
                ease: "easeOut"
              }
            } : {}}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Why Choose AI Humanizer?
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Our advanced AI technology transforms machine-generated text into natural, engaging content that resonates with human readers.
            </p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <SparklesIcon className="h-8 w-8 text-[#4A90E2]" />,
                title: "Natural Language",
                description: "Transform robotic text into fluid, conversational language that sounds authentically human."
              },
              {
                icon: <ZapIcon className="h-8 w-8 text-[#4A90E2]" />,
                title: "Instant Results",
                description: "Get humanized content in seconds, not minutes or hours. Perfect for tight deadlines."
              },
              {
                icon: <ShieldIcon className="h-8 w-8 text-[#4A90E2]" />,
                title: "Privacy Focused",
                description: "Your content remains private and secure. We never store or use your text for training."
              },
              {
                icon: <LineChartIcon className="h-8 w-8 text-[#4A90E2]" />,
                title: "Tone Control",
                description: "Adjust the tone to match your brand voice, from professional to casual or friendly."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 70,
                    damping: 15,
                    delay: 0.3 + (index * 0.15),
                    duration: 0.8
                  }
                } : {}}
                className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="rounded-full bg-[#4A90E2]/10 p-4 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        ref={howItWorksRef}
        initial={{ opacity: 0, y: 50 }}
        animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-24 bg-[#F5F7FA] dark:bg-gray-800 relative z-40"
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
            <motion.div 
              className="relative"
              ref={step1Ref}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={step1InView ? { 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              } : {}}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                <h3 className="text-xl font-bold mt-4 mb-2">Paste Your Text</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Start by pasting your AI-generated text into our editor. We accept content of any length or topic.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              ref={step2Ref}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={step2InView ? { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.15 }
              } : {}}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <h3 className="text-xl font-bold mt-4 mb-2">Select Your Tone</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose from professional, casual, or friendly tones to match your audience and brand voice.
                </p>
              </div>
            </motion.div>
            <motion.div 
              className="relative"
              ref={step3Ref}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={step3InView ? { 
                opacity: 1, 
                x: 0, 
                scale: 1,
                transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.3 }
              } : {}}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#4A90E2] rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                <h3 className="text-xl font-bold mt-4 mb-2">Get Humanized Text</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our AI instantly transforms your text, making it sound natural and human-written while preserving your message.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        ref={testimonialsRef}
        initial={{ opacity: 0, y: 50 }}
        animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="py-24 bg-white dark:bg-gray-900 relative z-50"
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
            {[
              {
                name: "Michael Thompson",
                role: "Marketing Director",
                image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
                quote: "AI Humanizer has transformed our content strategy. What used to take hours of manual editing now happens instantly. Our engagement metrics have improved dramatically."
              },
              {
                name: "Sarah Johnson",
                role: "Content Creator",
                image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
                quote: "I was skeptical at first, but AI Humanizer has become my secret weapon. My readers can't tell the difference between my writing and the AI-assisted content."
              },
              {
                name: "David Chen",
                role: "SEO Specialist",
                image: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg",
                quote: "The Pro plan has been a game-changer for our agency. We're producing more content than ever while maintaining a consistent, human-like voice across all our clients."
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={testimonialsInView ? { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 80,
                    damping: 15,
                    delay: index * 0.2
                  }
                } : {}}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: { duration: 0.3 }
                }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="rounded-full mr-4 w-12 h-12 object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        ref={ctaRef}
        initial={{ opacity: 0, y: 50 }}
        animate={ctaInView ? { 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 20,
          }
        } : {}}
        className="py-24 bg-[#4A90E2] text-white relative z-40"
      >
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={ctaInView ? { 
                opacity: 1, 
                x: 0,
                transition: { delay: 0.2, duration: 0.6 }
              } : {}}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Humanize Your Content?
              </h2>
              <p className="mt-4 text-lg opacity-90 max-w-xl">
                Start transforming your AI-generated text into engaging, human-like content today. No credit card required to get started.
              </p>
            </motion.div>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end"
              initial={{ opacity: 0, x: 30 }}
              animate={ctaInView ? { 
                opacity: 1, 
                x: 0,
                transition: { delay: 0.4, duration: 0.6 }
              } : {}}
            >
              <Button asChild size="lg" variant="default" className="bg-white text-[#4A90E2] hover:bg-gray-100 hover:scale-105 transition-transform">
                <Link href="/dashboard">
                  Try for Free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-[#4A90E2] bg-white hover:bg-gray-100 hover:text-[#3A80D2] hover:scale-105 transition-transform">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Add decorative elements for visual appeal */}
        <motion.div 
          className="absolute top-0 left-0 w-24 h-24 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.section>
      {/* Footer is provided by layout.tsx, do not render here */}
    </>
  );
}