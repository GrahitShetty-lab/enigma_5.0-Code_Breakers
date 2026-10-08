import React from 'react';
import { Link } from 'react-router-dom';
import heroImg from '../assets/hero.png';
import {
  FilePlus,
  LayoutGrid,
  ListTodo,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
  HeartHandshake
} from 'lucide-react';

const workflowSteps = [
  {
    step: '1',
    title: '1. Add basic details',
    description: 'Provide essential case information, legal heir identification, and deceased particulars.',
    icon: FilePlus,
  },
  {
    step: '2',
    title: '2. Organize financial information',
    description: 'Catalog bank accounts, insurance policies, EPF, demat investments, and liabilities.',
    icon: LayoutGrid,
  },
  {
    step: '3',
    title: '3. Identify pending actions',
    description: 'Discover immediate statutory claim deadlines, transmission requirements, and mandates.',
    icon: ListTodo,
  },
  {
    step: '4',
    title: '4. Track claims and documents',
    description: 'Manage death certificates, NOCs, claim forms, and transmission acknowledgments.',
    icon: FileText,
  },
  {
    step: '5',
    title: '5. Reach financial closure',
    description: 'Verify final fund settlements, tax compliance, and legal closure documentation.',
    icon: CheckCircle2,
  },
];

const Landing = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-border p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary border border-indigo-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Dignified & Confidential Estate Settlement</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-textPrimary tracking-tight leading-tight">
              Aasra
            </h1>

            <p className="text-xl sm:text-2xl font-medium text-primary">
              "Bringing clarity to financial closure."
            </p>

            <p className="text-base sm:text-lg text-textSecondary leading-relaxed">
              Navigating financial and legal closure after losing a loved one can feel overwhelming.
              Aasra provides a compassionate, guided workflow to organize bank accounts, insurance policies,
              EPF settlements, liabilities, and required documentation in one secure space.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/setup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium shadow-sm transition-colors text-center"
              >
                <span>Start a Closure Case</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-white hover:bg-subtle text-textPrimary font-medium transition-colors text-center"
              >
                <span>Explore Demo Dashboard</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-6 text-xs text-textMuted">
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-500" /> Free & Open Architecture
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-primary" /> Indian Banking & EPFO Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Local & Private Data Vault
              </span>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-sm p-6 bg-gradient-to-b from-indigo-50/50 to-white rounded-2xl border border-indigo-50/80 shadow-xs flex items-center justify-center">
              <img
                src={heroImg}
                alt="Aasra Estate Closure Flow Illustration"
                className="w-full h-auto max-h-72 object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Process Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary">
            How Aasra Works
          </h2>
          <p className="text-sm sm:text-base text-textSecondary">
            A structured, dignified five-step roadmap designed to guide families through statutory claims and financial closure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white p-5 rounded-xl border border-border shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-textPrimary text-sm sm:text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/60 text-xs font-semibold text-primary">
                  Step {step.step} of 5
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Landing;
