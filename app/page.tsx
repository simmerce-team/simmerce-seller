import { Button } from '@/components/ui/button';
import {
  BarChart,
  Check,
  CheckCircle,
  ChevronRight,
  Package,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function SellerHomePage() {
  const features = [
    {
      icon: <Package className="w-6 h-6 text-primary" />,
      title: "Easy Product Listings",
      description: "List your products quickly and reach thousands of potential buyers."
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Verified Buyers",
      description: "Connect with genuine B2B buyers looking for your products."
    },
    {
      icon: <BarChart className="w-6 h-6 text-primary" />,
      title: "Business Insights",
      description: "Get valuable analytics about your store performance and customer behavior."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Dedicated Support",
      description: "24/7 support to help you grow your business on our platform."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up and complete your business profile with verification."
    },
    {
      number: 2,
      title: "List Your Products",
      description: "Add your product catalog with images, pricing, and inventory."
    },
    {
      number: 3,
      title: "Start Selling",
      description: "Receive inquiries and orders from verified B2B buyers."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white/90 mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trusted by 10,000+ sellers across India
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Grow Your <span className="text-primary">B2B Business</span> 
              <br className="hidden md:block" />
              with Simmerce
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join India's fastest growing B2B marketplace. Connect with verified buyers, streamline your sales, and scale your business with our powerful tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Start Selling Now <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-white/20 bg-white/5 hover:bg-white text-white font-medium"
                >
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-slate-800"></div>
                ))}
              </div>
              <span>10,000+ Sellers</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <span>4.9/5 from 2,000+ reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need to <span className="text-primary">Succeed</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful tools and features designed to help your business grow in the digital marketplace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Feature Highlight */}
          <div className="mt-16 bg-gradient-to-r from-primary/5 to-white p-8 rounded-2xl border border-primary/10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Sell More with Less Effort</h3>
                <p className="text-slate-600 mb-6">
                  Our intelligent platform helps you reach the right buyers at the right time, with tools that make selling online easier than ever.
                </p>
                <ul className="space-y-3">
                  {[
                    'No listing fees - sell more, keep more',
                    'Secure payments and escrow protection',
                    'Dedicated account manager for premium sellers',
                    'Real-time analytics and insights'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:w-1/2 bg-slate-100 rounded-xl h-80 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Grow Your Business</h4>
                  <p className="text-slate-600 mb-4">Join sellers who are seeing 3x more sales on average</p>
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                    See Success Stories <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Start Selling in <span className="text-primary">3 Simple Steps</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get your products in front of thousands of B2B buyers in minutes
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/10 via-primary/20 to-primary/10 -ml-px"></div>
            
            <div className="space-y-12 md:space-y-16">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse md:text-left'}`}
                >
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary/5 to-white border-2 border-white shadow-md flex items-center justify-center relative z-10 mb-6 md:mb-0 ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12'}`}>
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
                      {step.number}
                    </div>
                  </div>
                  
                  <div className={`flex-1 p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                    {index === 0 && (
                      <div className="mt-4">
                        <Link href="/auth/signup" className="inline-flex items-center text-primary font-medium hover:underline">
                          Create your account now <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-sm mb-8">
              <div className="flex -space-x-2 mr-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-primary/10 border-2 border-white"></div>
                ))}
              </div>
              <span className="text-slate-700 font-medium">Join <span className="text-primary">10,000+</span> sellers growing with Simmerce</span>
            </div>
            
            <div className="space-y-4">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 px-8 h-12 text-base"
                >
                  Get Started - It's Free <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <p className="text-sm text-slate-500">No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
              Success Stories
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our <span className="text-primary">Sellers Say</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our community of successful sellers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Simmerce has transformed our business. We've seen a 3x increase in B2B orders since joining the platform.",
                author: "Rajesh Sharma",
                role: "Owner, Sharma Textiles",
                rating: 5
              },
              {
                quote: "The platform is incredibly easy to use, and the support team is always there to help. Highly recommended!",
                author: "Priya Patel",
                role: "CEO, Handicraft Exports",
                rating: 5
              },
              {
                quote: "We've expanded to 5 new cities thanks to the exposure we got from Simmerce. Truly a game-changer!",
                author: "Amit Kumar",
                role: "Director, Home Decor Inc",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-8 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-200 mr-4"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.author}</h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
        </div>
        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <Zap className="w-10 h-10 text-yellow-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Ready to Transform Your <span className="text-yellow-300">Business</span>?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of sellers who trust Simmerce to power their B2B sales and take your business to new heights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-slate-100 font-medium px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Start Selling Now - It's Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium px-8 py-6 text-lg transition-all"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-300">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/20"></div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
              <span>Free 14-day trial</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/20"></div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}