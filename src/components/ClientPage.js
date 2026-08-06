"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export const CONTACT = {
    whatsappNumber: "9779769403836",
    instagramHandle: "premiumhubnepal2"
};

export default function ClientPage({ pricingConfig: PRICING_CONFIG, blogs = [] }) {
    const [theme, setTheme] = useState("light");
    const [navOpen, setNavOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        platform: "netflix",
        plan: "Standard",
        emailPref: "own",
        paymentMethod: "esewa",
        transactionId: ""
    });
    const [toastVisible, setToastVisible] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        // Init theme
        const stored = localStorage.getItem("theme");
        const current = stored || (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
        setTheme(current);

        // Scroll reveal logic
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
            return () => observer.disconnect();
        } else {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }
    }, []);

    const toggleTheme = () => {
        const isDark = theme === "dark";
        const newTheme = isDark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", isDark ? "" : "dark");
        localStorage.setItem("theme", newTheme);
        setTheme(newTheme);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlatformChange = (e) => {
        const pId = e.target.value;
        setFormData({ ...formData, platform: pId, plan: PRICING_CONFIG[pId].plans[0].name });
    };

    const selectPlanAndScroll = (platformId, planName) => {
        setFormData({ ...formData, platform: platformId, plan: planName });
        document.getElementById("lead")?.scrollIntoView({ behavior: "smooth" });
    };

    const logOrder = async () => {
        if (!supabase) return;
        const platform = PRICING_CONFIG[formData.platform];
        const plan = platform.plans.find(p => p.name === formData.plan);
        const emailPrefLabel = formData.emailPref === "new" ? "New email" : "Use own email";
        const notes = `Payment: ${formData.paymentMethod.toUpperCase()} | TXN: ${formData.transactionId}`;
        try {
            await supabase.from("customers").insert([{
                name: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                platform: platform.label,
                plan: formData.plan,
                price: plan ? `NPR ${plan.priceNPR}` : "",
                subscription_email: emailPrefLabel,
                payment_status: "Pending",
                notes: notes
            }]);
        } catch (e) {
            console.error("Auto-log failed", e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone || !formData.email || !formData.transactionId) {
            alert("Please fill in your name, phone, email, and transaction ID first.");
            return;
        }
        await logOrder();
        setSubmitSuccess(true);
    };

    const barcodeHTML = () => {
        // Use deterministic values instead of Math.random() to prevent Next.js hydration errors
        const pattern = [
            { h: 14, w: 1.5 }, { h: 8, w: 3 }, { h: 12, w: 1.5 }, { h: 15, w: 1.5 },
            { h: 7, w: 3 }, { h: 11, w: 1.5 }, { h: 9, w: 3 }, { h: 13, w: 1.5 },
            { h: 10, w: 1.5 }, { h: 15, w: 3 }, { h: 6, w: 1.5 }, { h: 12, w: 1.5 },
            { h: 8, w: 3 }, { h: 14, w: 1.5 }
        ];
        
        return (
            <div className="barcode">
                {pattern.map((bar, i) => (
                    <span key={i} style={{ height: bar.h, width: bar.w }}></span>
                ))}
            </div>
        );
    };

    return (
        <>
            <header>
                <nav>
                    <div className="brand">
                        <img src="/logo-icon.png" alt="Premium Hub Nepal crest logo" className="brand-logo" /> 
                        Premium <span style={{ color: "var(--accent)" }}>Hub Nepal</span>
                    </div>
                    <ul className={`nav-links ${navOpen ? 'open' : ''}`} onClick={() => setNavOpen(false)}>
                        <li><a href="#netflix">Netflix</a></li>
                        <li><a href="#prime">Prime Video</a></li>
                        <li><a href="#spotify">Spotify</a></li>
                        <li><a href="#ytpremium">YT Premium</a></li>
                        <li><a href="#chatgpt">ChatGPT</a></li>
                        <li><a href="#claude">Claude</a></li>
                        <li><a href="#faq">FAQ</a></li>
                        <li><Link href="/tracker">Track Order</Link></li>
                    </ul>
                    <div className="nav-actions">
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
                            {theme === "dark" ? '☀️' : '🌙'}
                        </button>
                        <a href="#lead" className="nav-cta">Request a plan</a>
                        <button className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation">
                            {navOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </nav>
            </header>

            <section className="hero">
                <div className="hero-inner">
                    <div>
                        <h1>Your favourite platforms.<br /><span>One local price tag.</span></h1>
                        <p>Netflix, Spotify, Prime Video, YouTube Premium, ChatGPT and Claude — pick a plan, send us your
                            details, and we'll get you set up. No cards, no foreign payment hassle.</p>
                        <div className="hero-ctas">
                            <a href="#netflix" className="btn-primary">See all plans ↓</a>
                            <a href="#lead" className="btn-ghost">Talk to us</a>
                        </div>
                        <div className="hero-stats">
                            <div>
                                <div className="num">6</div>
                                <div className="lbl">platforms</div>
                            </div>
                            <div>
                                <div className="num">24hr</div>
                                <div className="lbl">typical setup</div>
                            </div>
                            <div>
                                <div className="num">NPR</div>
                                <div className="lbl">local pricing</div>
                            </div>
                        </div>
                    </div>
                    <div className="ticket-stack" aria-hidden="true">
                        <div className="stub s1">
                            <div className="stub-top"><span>SPOTIFY</span><span>PASS</span></div>
                            <div className="stub-name">Individual</div>
                            <div className="perf"></div>
                            <div className="stub-price" style={{ marginTop: 14 }}>NPR —</div>
                        </div>
                        <div className="stub s2">
                            <div className="stub-top"><span>NETFLIX</span><span>PASS</span></div>
                            <div className="stub-name">Standard HD</div>
                            <div className="perf"></div>
                            <div className="stub-price" style={{ marginTop: 14 }}>NPR —</div>
                        </div>
                        <div className="stub s3">
                            <div className="stub-top"><span>CLAUDE</span><span>PASS</span></div>
                            <div className="stub-name">Pro</div>
                            <div className="perf"></div>
                            <div className="stub-price" style={{ marginTop: 14 }}>NPR —</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="trust">
                <div className="trust-inner">
                    <div className="trust-card reveal">
                        <div className="trust-icon">✅</div>
                        <h4>Genuine Plans</h4>
                        <p>Official regional plans, not cracked or shared accounts</p>
                    </div>
                    <div className="trust-card reveal">
                        <div className="trust-icon">⚡</div>
                        <h4>Fast Setup</h4>
                        <p>Most accounts activated within 24 hours of payment</p>
                    </div>
                    <div className="trust-card reveal">
                        <div className="trust-icon">🇳🇵</div>
                        <h4>NPR Pricing</h4>
                        <p>Every price is in Nepali Rupees — no foreign currency hassle</p>
                    </div>
                    <div className="trust-card reveal">
                        <div className="trust-icon">💬</div>
                        <h4>Support Included</h4>
                        <p>Reach us on WhatsApp or Instagram anytime you need help</p>
                    </div>
                </div>
            </section>

            <div className="quicknav">
                <div className="quicknav-inner">
                    <a className="pill" href="#netflix">Netflix</a>
                    <a className="pill" href="#prime">Prime Video</a>
                    <a className="pill" href="#spotify">Spotify</a>
                    <a className="pill" href="#ytpremium">YouTube Premium</a>
                    <a className="pill" href="#chatgpt">ChatGPT</a>
                    <a className="pill" href="#claude">Claude</a>
                </div>
            </div>

            <div id="platform-sections">
                {Object.values(PRICING_CONFIG).map((platform) => (
                    <section key={platform.id} className="platform" id={platform.id}>
                        <div className="wrap">
                            <div className="platform-head">
                                <h2>{platform.label}</h2>
                                <span className="tag mono">{platform.tag}</span>
                            </div>
                            <div className="plans-row">
                                {platform.plans.map((plan) => (
                                    <div key={plan.name} className="ticket reveal">
                                        <span className="ticket-notch-l"></span>
                                        <div className="ticket-info">
                                            <div className="plan-name">{plan.name}</div>
                                            <div className="plan-desc">{plan.desc}</div>
                                            <ul>
                                                {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                                            </ul>
                                        </div>
                                        <div className="perf-v"></div>
                                        <span className="ticket-notch-r"></span>
                                        <div className="ticket-stub">
                                            {plan.originalPriceNPR && (
                                                <>
                                                    <div className="offer-tag">Offer price</div>
                                                    <div className="original-price">NPR {plan.originalPriceNPR.toLocaleString('en-IN')}</div>
                                                </>
                                            )}
                                            <div className="price">
                                                NPR {plan.priceNPR.toLocaleString('en-IN')}
                                                <small>per month*</small>
                                            </div>
                                            {barcodeHTML()}
                                            <button className="get-btn" onClick={() => selectPlanAndScroll(platform.id, plan.name)}>
                                                Get this pass
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            <section className="compare" id="compare">
                <div className="compare-inner">
                    <h2>Platform comparison</h2>
                    <div className="compare-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Platform</th>
                                    <th>Category</th>
                                    <th>Starting price</th>
                                    <th>Plans available</th>
                                    <th>Key feature</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="platform-label">Netflix</td><td>Movies & Shows</td><td className="price-col">NPR 429/mo</td><td>4</td><td>4K Ultra HD, up to 4 screens</td>
                                </tr>
                                <tr>
                                    <td className="platform-label">Prime Video</td><td>Movies, Shows & Perks</td><td className="price-col">NPR 669/mo</td><td>3</td><td>Full HD + Prime delivery perks</td>
                                </tr>
                                <tr>
                                    <td className="platform-label">Spotify</td><td>Music & Podcasts</td><td className="price-col">NPR 409/mo</td><td>4</td><td>Ad-free music, offline downloads</td>
                                </tr>
                                <tr>
                                    <td className="platform-label">YouTube Premium</td><td>Ad-free Video & Music</td><td className="price-col">NPR 429/mo</td><td>2</td><td>No ads + YT Music Premium</td>
                                </tr>
                                <tr>
                                    <td className="platform-label">ChatGPT</td><td>AI Assistant</td><td className="price-col">NPR 899/mo</td><td>3</td><td>Access to GPT-5 & advanced tools</td>
                                </tr>
                                <tr>
                                    <td className="platform-label">Claude</td><td>AI Assistant</td><td className="price-col">NPR 3859/mo</td><td>4</td><td>Extended usage & unlimited Projects</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="how">
                <div className="how-inner">
                    <h2>How it works</h2>
                    <div className="steps">
                        <div className="step reveal">
                            <div className="step-num">01</div>
                            <h3>Pick your plan</h3>
                            <p>Browse the platforms above and choose the tier that fits — every price is already converted to NPR.</p>
                        </div>
                        <div className="step reveal">
                            <div className="step-num">02</div>
                            <h3>Send your details</h3>
                            <p>Fill the short form with your name, phone and email, or message us directly on Instagram or WhatsApp.</p>
                        </div>
                        <div className="step reveal">
                            <div className="step-num">03</div>
                            <h3>We set you up</h3>
                            <p>We'll confirm payment details with you directly and get your access ready, usually within a day.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="payments">
                <div className="payments-inner">
                    <h2>Accepted payment methods</h2>
                    <p className="payments-sub">Pay using any of these popular Nepali payment options</p>
                    <div className="payment-methods">
                        <div className="payment-card reveal">
                            <div className="pay-icon" style={{ background: "#60BB46" }}>eSewa</div>
                            <div className="pay-name">eSewa</div>
                        </div>
                        <div className="payment-card reveal">
                            <div className="pay-icon" style={{ background: "#5C2D91" }}>Khalti</div>
                            <div className="pay-name">Khalti</div>
                        </div>
                        <div className="payment-card reveal">
                            <div className="pay-icon" style={{ background: "#0072BC" }}>IME</div>
                            <div className="pay-name">IME Pay</div>
                        </div>
                        <div className="payment-card reveal">
                            <div className="pay-icon" style={{ background: "var(--text)" }}>Bank</div>
                            <div className="pay-name">Bank Transfer</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="blog" id="blog">
                <div className="blog-inner">
                    <h2>Tips &amp; Guides</h2>
                    <p className="blog-sub">Helpful reads to make the most of your subscriptions</p>
                    <div className="blog-grid">
                        {blogs.length === 0 ? (
                            <p style={{color: "var(--muted)"}}>More guides coming soon...</p>
                        ) : (
                            blogs.map((blog) => (
                                <div key={blog.id} className="blog-card reveal visible">
                                    <div className="blog-card-body">
                                        {blog.tags && <span className="blog-tag">{blog.tags.split(',')[0]}</span>}
                                        <h3>{blog.title}</h3>
                                        <p>{blog.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}...</p>
                                        <Link href={`/blog/${blog.slug}`} className="blog-link">Read more →</Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="faq" id="faq">
                <div className="faq-inner">
                    <h2>Questions people ask</h2>
                    <details>
                        <summary>Are these official subscriptions?</summary>
                        <p>We're an independent reseller, not an official partner of any of the platforms listed. Prices are based on official regional rates, converted to NPR.</p>
                    </details>
                    <details>
                        <summary>How do I pay?</summary>
                        <p>Payment is handled directly with you after you reach out — we'll share the details on WhatsApp or Instagram once you request a plan.</p>
                    </details>
                    <details>
                        <summary>What if my access stops working?</summary>
                        <p>Message us on WhatsApp or Instagram and we'll sort it out. Let us know which plan and platform you're on so we can help faster.</p>
                    </details>
                    <details>
                        <summary>Can I switch plans later?</summary>
                        <p>Yes — reach out to us any time and we'll help you move to a different plan or platform.</p>
                    </details>
                    <details>
                        <summary>How long does setup take?</summary>
                        <p>Most plans are activated within 24 hours of confirmed payment. During busy periods it may take a little longer, but we'll keep you updated via WhatsApp or Instagram.</p>
                    </details>
                    <details>
                        <summary>Can I use this on multiple devices?</summary>
                        <p>It depends on the plan you pick. For example, Netflix Standard lets you stream on 2 screens at once, and Spotify Family covers up to 6 accounts. Check the plan details above for specifics.</p>
                    </details>
                    <details>
                        <summary>Do you accept eSewa, Khalti or IME Pay?</summary>
                        <p>Yes! We accept eSewa, Khalti, IME Pay and direct bank transfer. After you submit your request we'll share the payment details directly.</p>
                    </details>
                    <details>
                        <summary>What if I already have an account on a platform?</summary>
                        <p>No problem — just choose "Use my own email" in the form and we'll work with your existing account. If you'd rather start fresh, we can set up a new one for you.</p>
                    </details>
                    <details>
                        <summary>How do renewals work?</summary>
                        <p>We'll reach out to you on WhatsApp or Instagram before your plan expires so you can renew without any gap in access. No surprise charges — we always confirm with you first.</p>
                    </details>
                </div>
            </section>

            <section className="lead" id="lead">
                <div className="lead-inner">
                    <div className="referral reveal">
                        <h3>🎁 Refer a friend</h3>
                        <p>Tell a friend about Premium Hub Nepal — when they subscribe, both of you get a discount on your next renewal. Just mention the referral when you message us!</p>
                    </div>
                    <h2>Request your plan</h2>
                    <p>Tell us what you'd like and we'll get in touch to sort out payment and access.</p>
                    <div className="form-card">
                        {submitSuccess ? (
                            <div className="toast" style={{ display: 'block', background: 'var(--accent-soft)', color: 'var(--text)' }}>
                                <h3 style={{marginBottom: "10px"}}>Order Received! 🎉</h3>
                                <p>We're verifying your payment. We will contact you shortly with your account details.</p>
                                <button className="btn-secondary" style={{marginTop:"15px"}} onClick={() => { setSubmitSuccess(false); setFormData({...formData, transactionId: ""})}}>Submit another request</button>
                            </div>
                        ) : (
                            <form id="leadForm" onSubmit={handleSubmit}>
                                <div className="field">
                                    <label htmlFor="fullName">Full name</label>
                                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleFormChange} required placeholder="e.g. Sanjay Thapa" />
                                </div>
                                <div className="two-col">
                                    <div className="field">
                                        <label htmlFor="phone">Phone number</label>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} required placeholder="98XXXXXXXX" />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="email">Email</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required placeholder="you@example.com" />
                                    </div>
                                </div>
                                <div className="two-col">
                                    <div className="field">
                                        <label htmlFor="platformSelect">Platform</label>
                                        <select id="platformSelect" name="platform" value={formData.platform} onChange={handlePlatformChange}>
                                            {Object.values(PRICING_CONFIG).map(p => (
                                                <option key={p.id} value={p.id}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label htmlFor="planSelect">Plan</label>
                                        <select id="planSelect" name="plan" value={formData.plan} onChange={handleFormChange}>
                                            {PRICING_CONFIG[formData.platform]?.plans.map(p => (
                                                <option key={p.name} value={p.name}>{p.name} — NPR {p.priceNPR.toLocaleString('en-IN')}/mo</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Which email should the subscription use? <span style={{ fontWeight: 400 }}>(optional)</span></label>
                                    <div className="radio-group">
                                        <label className="radio-option">
                                            <input type="radio" name="emailPref" value="own" checked={formData.emailPref === 'own'} onChange={handleFormChange} />
                                            Use my own email
                                        </label>
                                        <label className="radio-option">
                                            <input type="radio" name="emailPref" value="new" checked={formData.emailPref === 'new'} onChange={handleFormChange} />
                                            Create a new email for me
                                        </label>
                                    </div>
                                </div>

                                <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "25px 0" }} />

                                <div className="field">
                                    <label>Select Payment Method</label>
                                    <div className="radio-group" style={{ marginBottom: "20px" }}>
                                        <label className="radio-option" style={{ padding: "12px", border: formData.paymentMethod === 'esewa' ? "2px solid #60BB46" : "1px solid var(--line)", borderRadius: "10px", background: formData.paymentMethod === 'esewa' ? "#eaf6e6" : "var(--surface)" }}>
                                            <input type="radio" name="paymentMethod" value="esewa" checked={formData.paymentMethod === 'esewa'} onChange={handleFormChange} />
                                            <span style={{color: "#60BB46", fontWeight: "bold"}}>eSewa</span>
                                        </label>
                                        <label className="radio-option" style={{ padding: "12px", border: formData.paymentMethod === 'khalti' ? "2px solid #5C2D91" : "1px solid var(--line)", borderRadius: "10px", background: formData.paymentMethod === 'khalti' ? "#efe6f6" : "var(--surface)" }}>
                                            <input type="radio" name="paymentMethod" value="khalti" checked={formData.paymentMethod === 'khalti'} onChange={handleFormChange} />
                                            <span style={{color: "#5C2D91", fontWeight: "bold"}}>Khalti</span>
                                        </label>
                                    </div>
                                    
                                    <div style={{ textAlign: "center", marginBottom: "25px", background: "var(--surface-alt)", padding: "20px", borderRadius: "12px", border: "1px dashed var(--muted)" }}>
                                        <p style={{ marginBottom: "15px", fontSize: "0.95rem" }}>Scan to pay exactly <strong style={{color:"var(--accent)", fontSize:"1.1rem"}}>NPR {PRICING_CONFIG[formData.platform]?.plans.find(p => p.name === formData.plan)?.priceNPR}</strong></p>
                                        <img 
                                            src={formData.paymentMethod === "esewa" ? "/esewa-qr.png" : "/khalti-qr.png"} 
                                            alt={`${formData.paymentMethod} QR code`}
                                            style={{ maxWidth: "220px", borderRadius: "10px", border: "1px solid var(--line)" }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="field">
                                    <label htmlFor="transactionId">Transaction ID / Remarks</label>
                                    <input type="text" id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleFormChange} required placeholder="e.g. 00012345" />
                                </div>
                                
                                <div className="submit-row" style={{marginTop:"20px"}}>
                                    <button type="submit" className="btn-block btn-primary" style={{padding: "16px", fontSize: "1.05rem"}}>
                                        Confirm & Submit Request
                                    </button>
                                </div>
                                <p className="form-note">By submitting, you confirm that you have made the payment to the QR code above.</p>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <footer>
                <div className="footer-signature">
                    <img src="/logo-full.png" alt="Premium Hub Nepal logo" className="footer-logo" />
                </div>
                <div className="footer-inner">
                    <div>
                        <div className="brand" style={{ marginBottom: 10 }}>
                            <img src="/logo-icon.png" alt="Premium Hub Nepal crest logo" className="brand-logo" /> Premium <span style={{ color: "var(--accent)" }}>Hub Nepal</span>
                        </div>
                        <p>Local pricing for the platforms you already use — Netflix, Spotify, Prime Video, YouTube Premium, ChatGPT and Claude, made simple for Nepal.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#lead">Request a plan</a>
                        <Link href="/tracker">Track Order</Link>
                        <a href={`https://instagram.com/${CONTACT.instagramHandle}`} target="_blank" rel="noopener">Instagram</a>
                        <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener">WhatsApp</a>
                    </div>
                </div>
                <p className="disclaimer">Premium Hub Nepal is an independent reseller and is not affiliated with, endorsed by, or officially partnered with Netflix, Amazon Prime Video, Spotify, YouTube, OpenAI, or Anthropic. All trademarks belong to their respective owners. Prices are indicative and based on official regional pricing, converted to NPR.</p>
            </footer>

            <a className="fab-wa" href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
                <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </>
    );
}
