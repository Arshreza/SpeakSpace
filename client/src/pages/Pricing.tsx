import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, X, Zap, Crown, Building2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/authStore"
import api from "@/utils/api"
import toast from "react-hot-toast"

const plans = [
  {
    id: "free", name: "Free", icon: Zap, monthly: 0, annual: 0,
    description: "Perfect for getting started",
    color: "from-slate-500 to-slate-600",
    borderColor: "border-white/10",
    popular: false,
    features: [
      { text: "5 mock interviews/month", included: true },
      { text: "1 resume upload", included: true },
      { text: "Basic AI feedback", included: true },
      { text: "Company database access", included: true },
      { text: "Voice interview", included: false },
      { text: "Coding interview module", included: false },
      { text: "AI Career Coach", included: false },
      { text: "Download reports", included: false },
      { text: "Priority support", included: false },
    ]
  },
  {
    id: "premium", name: "Premium", icon: Crown, monthly: 9.99, annual: 7.99,
    description: "For serious interview prep",
    color: "from-indigo-500 to-purple-600",
    borderColor: "border-indigo-500/50",
    popular: true,
    features: [
      { text: "100 mock interviews/month", included: true },
      { text: "10 resume uploads", included: true },
      { text: "Advanced AI feedback", included: true },
      { text: "Company database access", included: true },
      { text: "Voice interview", included: true },
      { text: "Coding interview module", included: true },
      { text: "AI Career Coach", included: true },
      { text: "Download reports", included: true },
      { text: "Priority support", included: false },
    ]
  },
  {
    id: "enterprise", name: "Enterprise", icon: Building2, monthly: 29.99, annual: 23.99,
    description: "For teams and organizations",
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/30",
    popular: false,
    features: [
      { text: "Unlimited interviews", included: true },
      { text: "Unlimited resumes", included: true },
      { text: "Advanced AI feedback", included: true },
      { text: "Company database access", included: true },
      { text: "Voice interview", included: true },
      { text: "Coding interview module", included: true },
      { text: "AI Career Coach", included: true },
      { text: "Download reports", included: true },
      { text: "Priority support", included: true },
    ]
  }
]

const faqs = [
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period." },
  { q: "Is there a free trial?", a: "The Premium plan comes with a 7-day free trial for new users. No credit card required to start the trial." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe. For users in India, we also support UPI and cards via Razorpay." },
  { q: "Can I switch plans?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
  { q: "What happens to my data if I cancel?", a: "Your interview history and reports remain accessible for 30 days after cancellation. You can export them at any time." },
  { q: "Do you offer student discounts?", a: "Yes! Students with a valid .edu email get 40% off the Premium plan. Contact support to apply." },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (planId === "free") { navigate("/dashboard"); return }
    setLoading(planId)
    try {
      const res = await api.post("/payment/stripe/checkout", { plan: planId })
      if (res.data.data?.url) window.location.href = res.data.data.url
    } catch {
      toast.error("Failed to start checkout. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const handleRazorpay = async (planId: string) => {
    if (!isAuthenticated) { navigate("/login"); return }
    setLoading(`rzp-${planId}`)
    try {
      const res = await api.post("/payment/razorpay/order", { plan: planId })
      const { orderId, amount, currency, keyId } = res.data.data
      const options = {
        key: keyId, amount, currency, order_id: orderId,
        name: "SpeckSpace", description: `${planId} Plan`,
        handler: async (response: any) => {
          await api.post("/payment/razorpay/verify", { ...response, plan: planId })
          toast.success("Payment successful! Subscription activated.")
          navigate("/dashboard")
        },
        theme: { color: "#6366f1" }
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch {
      toast.error("Razorpay checkout failed. Please try Stripe.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold">SpeckSpace</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 border mb-4">Pricing</Badge>
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Start free, upgrade when you're ready. No hidden fees.</p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isAnnual ? "text-white" : "text-slate-500"}`}>Monthly</span>
            <button onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? "bg-indigo-600" : "bg-slate-700"}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAnnual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${isAnnual ? "text-white" : "text-slate-500"}`}>
              Annual <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border text-xs">Save 20%</Badge>
            </span>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            const price = isAnnual ? plan.annual : plan.monthly
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative bg-slate-900/60 border ${plan.borderColor} rounded-2xl p-6 ${plan.popular ? "ring-2 ring-indigo-500/50" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-0 px-4">Most Popular</Badge>
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-black text-white">${price}</span>
                  <span className="text-slate-500 text-sm">/month</span>
                  {isAnnual && price > 0 && <p className="text-slate-500 text-xs mt-1">Billed annually (${(price * 12).toFixed(2)}/yr)</p>}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full mb-4 ${plan.popular ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0" : "border-white/10 bg-white/5 hover:bg-white/10"} text-white`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {loading === plan.id ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</span>
                    : plan.id === "free" ? "Get Started Free" : `Start ${plan.name}`}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm">
                      {f.included
                        ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <X className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                      <span className={f.included ? "text-slate-300" : "text-slate-600"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>

        {/* Razorpay section */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-16 text-center">
          <h3 className="text-white font-semibold mb-2">Prefer to pay in INR?</h3>
          <p className="text-slate-400 text-sm mb-4">Use Razorpay to pay with UPI, Net Banking, or Card in Indian Rupees.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => handleRazorpay("premium")} disabled={!!loading} variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Premium — ₹799/month
            </Button>
            <Button onClick={() => handleRazorpay("enterprise")} disabled={!!loading} variant="outline" className="border-white/10 text-white hover:bg-white/5">
              Enterprise — ₹2,499/month
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-slate-900/60 border border-white/10 rounded-xl px-5">
                <AccordionTrigger className="text-white text-sm font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}
