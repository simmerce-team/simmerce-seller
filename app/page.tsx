import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Package, Shield, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SellerHomePage() {
  const features = [
    {
      icon: <Package className="w-6 h-6 text-red-600" />,
      title: "Easy Product Listings",
      description: "List your products quickly and reach thousands of potential buyers."
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "Verified Buyers",
      description: "Connect with genuine B2B buyers looking for your products."
    },
    {
      icon: <BarChart className="w-6 h-6 text-red-600" />,
      title: "Business Insights",
      description: "Get valuable analytics about your store performance and customer behavior."
    },
    {
      icon: <Users className="w-6 h-6 text-red-600" />,
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
      <section className="py-20 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Grow Your B2B Business Online
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            Join Simmerce's trusted B2B marketplace to reach more customers, increase sales, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-medium">
                Start Selling Now
              </Button>
            </Link>
            <Link href="/#features">
              <Button variant="outline" size="lg" className="border-slate-200 hover:bg-slate-50 font-medium">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Sell With Us?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to succeed in B2B eCommerce
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Get Started in 3 Easy Steps</h2>
            <p className="text-slate-600">Start selling to businesses across India today</p>
          </div>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-medium">
                Join Now - It's Free to Start
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of sellers who are already growing their business on Simmerce
          </p>
          <Link href="/auth/signup">
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-slate-100 font-medium"
            >
              Start Selling Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}