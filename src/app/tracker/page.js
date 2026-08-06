"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import "./tracker.css";
import Image from "next/image";

export default function Tracker() {
    const [session, setSession] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gateError, setGateError] = useState("");
    
    const [activeTab, setActiveTab] = useState("customers"); // "customers" or "pricing"

    // --- Customers State ---
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [setupError, setSetupError] = useState("");
    
    const [formData, setFormData] = useState({
        f_name: "", f_phone: "", f_email: "", f_platform: "",
        f_plan: "", f_price: "", f_emailpref: "Use own email",
        f_status: "Pending", f_renewal: "", f_notes: ""
    });
    const [addStatus, setAddStatus] = useState("");

    // --- Pricing State ---
    const [platforms, setPlatforms] = useState([]);
    const [plans, setPlans] = useState([]);
    const [pricingLoading, setPricingLoading] = useState(false);

    // --- Blog State ---
    const [blogs, setBlogs] = useState([]);
    const [blogLoading, setBlogLoading] = useState(false);
    const [blogForm, setBlogForm] = useState({
        id: "", slug: "", title: "", content: "", tags: "", published: false
    });

    useEffect(() => {
        checkExistingSession();
    }, []);

    useEffect(() => {
        if (session) {
            if (activeTab === "customers") {
                loadCustomers();
            } else if (activeTab === "pricing") {
                loadPricing();
            } else if (activeTab === "blog") {
                loadBlogs();
            }
        }
    }, [session, activeTab]);

    const checkExistingSession = async () => {
        if (!supabase) {
            setSetupError("Connect Supabase first.");
            return;
        }
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
            setSession(currentSession);
        }
    };

    const tryLogin = async () => {
        if (!supabase) {
            setGateError("Connect Supabase first.");
            return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setGateError("Incorrect email or password.");
        } else {
            setSession(data.session);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setPassword("");
    };

    const loadCustomers = async () => {
        if (!supabase) return;
        setLoading(true);
        setSetupError("");
        try {
            const { data, error } = await supabase
                .from("customers")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            setSetupError("Couldn't load data. Check your Supabase URL/key and that you're logged in.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPricing = async () => {
        if (!supabase) return;
        setPricingLoading(true);
        try {
            const { data: platData, error: platError } = await supabase.from("platforms").select("*").order("order_index");
            if (platError) throw platError;
            setPlatforms(platData || []);

            const { data: planData, error: planError } = await supabase.from("plans").select("*").order("order_index");
            if (planError) throw planError;
            setPlans(planData || []);
        } catch (err) {
            console.error("Error loading pricing:", err);
            alert("Couldn't load pricing. Did you run the Phase 2 SQL script?");
        } finally {
            setPricingLoading(false);
        }
    };

    const loadBlogs = async () => {
        if (!supabase) return;
        setBlogLoading(true);
        try {
            const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            setBlogs(data || []);
        } catch (err) {
            console.error("Error loading blogs:", err);
            alert("Couldn't load blogs. Did you run the Phase 4 SQL script?");
        } finally {
            setBlogLoading(false);
        }
    };

    const handleSaveBlog = async (e) => {
        e.preventDefault();
        const payload = {
            slug: blogForm.slug.trim(),
            title: blogForm.title.trim(),
            content: blogForm.content.trim(),
            tags: blogForm.tags.trim(),
            published: blogForm.published
        };

        let error;
        if (blogForm.id) {
            const { error: updErr } = await supabase.from("blogs").update(payload).eq("id", blogForm.id);
            error = updErr;
        } else {
            const { error: insErr } = await supabase.from("blogs").insert([payload]);
            error = insErr;
        }

        if (error) {
            alert("Error saving blog: " + error.message);
        } else {
            alert("Blog saved!");
            setBlogForm({ id: "", slug: "", title: "", content: "", tags: "", published: false });
            loadBlogs();
        }
    };
    
    const editBlog = (blog) => {
        setBlogForm({
            id: blog.id,
            slug: blog.slug,
            title: blog.title,
            content: blog.content,
            tags: blog.tags || "",
            published: blog.published
        });
    };
    
    const deleteBlog = async (id) => {
        if (!confirm("Delete this blog post?")) return;
        const { error } = await supabase.from("blogs").delete().eq("id", id);
        if (error) alert("Error deleting.");
        else loadBlogs();
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        setAddStatus("Saving...");

        const enteredRenewal = formData.f_renewal;
        const enteredStatus = formData.f_status;

        const addDaysAsISODate = (days) => {
            const d = new Date();
            d.setDate(d.getDate() + days);
            return d.toISOString().split("T")[0];
        };

        const payload = {
            name: formData.f_name.trim(),
            phone: formData.f_phone.trim(),
            email: formData.f_email.trim(),
            platform: formData.f_platform.trim(),
            plan: formData.f_plan.trim(),
            price: formData.f_price.trim(),
            subscription_email: formData.f_emailpref,
            payment_status: enteredStatus,
            renewal_date: enteredRenewal || (enteredStatus === "Done" ? addDaysAsISODate(30) : null),
            notes: formData.f_notes.trim()
        };

        const { error } = await supabase.from("customers").insert([payload]);

        if (error) {
            setAddStatus("Couldn't save — check your connection.");
            console.error(error);
        } else {
            setAddStatus("Customer added.");
            setFormData({
                f_name: "", f_phone: "", f_email: "", f_platform: "",
                f_plan: "", f_price: "", f_emailpref: "Use own email",
                f_status: "Pending", f_renewal: "", f_notes: ""
            });
            loadCustomers();
            setTimeout(() => setAddStatus(""), 3000);
        }
    };

    const updateStatus = async (id, newStatus) => {
        const updatePayload = { payment_status: newStatus };
        if (newStatus === "Done") {
            const d = new Date();
            d.setDate(d.getDate() + 30);
            updatePayload.renewal_date = d.toISOString().split("T")[0];
        }

        const { error } = await supabase.from("customers").update(updatePayload).eq("id", id);
        if (error) {
            alert("Couldn't update status.");
        } else {
            loadCustomers();
        }
    };

    const deleteCustomer = async (id) => {
        if (!confirm("Delete this customer record? This can't be undone.")) return;
        const { error } = await supabase.from("customers").delete().eq("id", id);
        if (error) {
            alert("Couldn't delete.");
        } else {
            loadCustomers();
        }
    };

    const updatePlanPrice = async (planId, newPrice, newOriginalPrice) => {
        const { error } = await supabase
            .from("plans")
            .update({ price_npr: newPrice, original_price_npr: newOriginalPrice || null })
            .eq("id", planId);
            
        if (error) {
            alert("Error updating price.");
        } else {
            loadPricing();
            alert("Price updated! It is now live on the website.");
        }
    };

    // Derived states
    const filtered = customers.filter(c => {
        const haystack = `${c.name || ""} ${c.phone || ""} ${c.platform || ""} ${c.plan || ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
    });

    const now = new Date();
    const thisMonthCount = customers.filter(c => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const renderRenewalCell = (renewalDate) => {
        if (!renewalDate) return <span className="mono" style={{color:"var(--muted)"}}>—</span>;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const renewal = new Date(renewalDate);
        const daysUntil = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));

        let color = "var(--text)";
        let label = renewalDate;

        if (daysUntil < 0) {
            color = "var(--danger)";
            label += ` (overdue)`;
        } else if (daysUntil <= 3) {
            color = "var(--accent)";
            label += ` (${daysUntil === 0 ? "today" : daysUntil + "d left"})`;
        }

        return <span className="mono" style={{color, fontWeight: daysUntil <= 3 ? "600" : "400"}}>{label}</span>;
    };

    if (!session) {
        return (
            <div className="tracker-page">
                <div id="gate">
                    <img src="/logo-icon.png" alt="Premium Hub Nepal" />
                    <h1>Admin Login</h1>
                    <p>Log in with the account you created in your Supabase dashboard.</p>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryLogin()} />
                    <button id="gateSubmit" onClick={tryLogin}>Log in</button>
                    {gateError && <p id="gateError" style={{display:"block"}}>{gateError}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="tracker-page">
            <div id="dashboard" style={{display:"block"}}>
                <div className="wrap">
                    <header className="top" style={{marginBottom: "20px"}}>
                        <div className="brand"><img src="/logo-icon.png" alt="Premium Hub Nepal" /> Admin Dashboard</div>
                        <div style={{display:"flex", gap:"10px"}}>
                            <button className="btn-secondary" onClick={logout}>Log out</button>
                        </div>
                    </header>
                    
                    <div style={{display:"flex", gap:"10px", marginBottom: "30px", borderBottom: "1px solid var(--line)", paddingBottom: "10px"}}>
                        <button 
                            className={`btn ${activeTab === 'customers' ? '' : 'btn-secondary'}`} 
                            onClick={() => setActiveTab("customers")}
                        >
                            Customers Tracker
                        </button>
                        <button 
                            className={`btn ${activeTab === 'pricing' ? '' : 'btn-secondary'}`} 
                            onClick={() => setActiveTab("pricing")}
                        >
                            Pricing Manager
                        </button>
                        <button 
                            className={`btn ${activeTab === 'blog' ? '' : 'btn-secondary'}`} 
                            onClick={() => setActiveTab("blog")}
                        >
                            Blog Manager
                        </button>
                    </div>

                    {setupError && <div className="setup-note" style={{display:"block"}}>{setupError}</div>}

                    {activeTab === "customers" && (
                        <>
                            <div className="stat-row">
                                <div className="stat-card">
                                    <div className="num">{customers.length}</div>
                                    <div className="lbl">Total customers</div>
                                </div>
                                <div className="stat-card">
                                    <div className="num">{customers.filter(c => (c.payment_status || "").toLowerCase() === "done").length}</div>
                                    <div className="lbl">Marked done</div>
                                </div>
                                <div className="stat-card">
                                    <div className="num">{customers.filter(c => (c.payment_status || "pending").toLowerCase() === "pending").length}</div>
                                    <div className="lbl">Pending payment</div>
                                </div>
                                <div className="stat-card">
                                    <div className="num">{thisMonthCount}</div>
                                    <div className="lbl">Added this month</div>
                                </div>
                            </div>

                            <div className="panel">
                                <h2>Add a customer manually</h2>
                                <form id="addForm" onSubmit={handleAddCustomer}>
                                    <div className="add-grid">
                                        <div><label>Name</label><input type="text" value={formData.f_name} onChange={e => setFormData({...formData, f_name: e.target.value})} required /></div>
                                        <div><label>Phone</label><input type="text" value={formData.f_phone} onChange={e => setFormData({...formData, f_phone: e.target.value})} required /></div>
                                        <div><label>Email</label><input type="email" value={formData.f_email} onChange={e => setFormData({...formData, f_email: e.target.value})} /></div>
                                        <div><label>Platform</label><input type="text" placeholder="e.g. Netflix" value={formData.f_platform} onChange={e => setFormData({...formData, f_platform: e.target.value})} required /></div>
                                        <div><label>Plan</label><input type="text" placeholder="e.g. Standard" value={formData.f_plan} onChange={e => setFormData({...formData, f_plan: e.target.value})} /></div>
                                        <div><label>Price (NPR)</label><input type="text" placeholder="e.g. 1119" value={formData.f_price} onChange={e => setFormData({...formData, f_price: e.target.value})} /></div>
                                        <div><label>Subscription email</label>
                                            <select value={formData.f_emailpref} onChange={e => setFormData({...formData, f_emailpref: e.target.value})}>
                                                <option value="Use own email">Use own email</option>
                                                <option value="New email">New email</option>
                                            </select>
                                        </div>
                                        <div><label>Payment status</label>
                                            <select value={formData.f_status} onChange={e => setFormData({...formData, f_status: e.target.value})}>
                                                <option value="Pending">Pending</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        </div>
                                        <div><label>Renewal date</label><input type="date" value={formData.f_renewal} onChange={e => setFormData({...formData, f_renewal: e.target.value})} /></div>
                                    </div>
                                    <div>
                                        <label style={{display:"block", fontSize:"0.76rem", color:"var(--muted)", marginBottom:"5px"}}>Notes</label>
                                        <textarea rows="2" value={formData.f_notes} onChange={e => setFormData({...formData, f_notes: e.target.value})} style={{width:"100%", padding:"9px 12px", background:"var(--surface-alt)", border:"1px solid var(--line)", borderRadius:"8px", color:"var(--text)", fontFamily:"'Inter'", fontSize:"0.86rem"}}></textarea>
                                    </div>
                                    <div style={{marginTop:"14px"}}>
                                        <button type="submit" className="btn">Add customer</button>
                                    </div>
                                    {addStatus && <p id="addStatus" style={{display:"block"}}>{addStatus}</p>}
                                </form>
                            </div>

                            <div className="panel">
                                <div className="toolbar">
                                    <h2 style={{marginBottom:0}}>All customers</h2>
                                    <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                                        <input type="text" placeholder="Search name, phone, platform..." value={search} onChange={e => setSearch(e.target.value)} />
                                        <button className="btn-secondary" onClick={loadCustomers}>Refresh</button>
                                    </div>
                                </div>
                                {loading && <div id="loadingState" style={{display:"block"}}>Loading customer data...</div>}
                                {!loading && filtered.length === 0 && (
                                    <div id="emptyState" style={{display:"block"}}>
                                        {customers.length === 0 ? "No customers yet. Add one above, or wait for your first website order to come in." : "No matches for that search."}
                                    </div>
                                )}
                                {!loading && filtered.length > 0 && (
                                    <div className="table-scroll">
                                        <table id="customerTable">
                                            <thead>
                                                <tr>
                                                    <th>Date added</th>
                                                    <th>Name</th>
                                                    <th>Phone</th>
                                                    <th>Email</th>
                                                    <th>Platform</th>
                                                    <th>Plan</th>
                                                    <th>Price</th>
                                                    <th>Sub. email</th>
                                                    <th>Status</th>
                                                    <th>Renewal</th>
                                                    <th>Notes</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map(c => (
                                                    <tr key={c.id}>
                                                        <td className="mono">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                                                        <td>{c.name}</td>
                                                        <td className="mono">{c.phone}</td>
                                                        <td>{c.email}</td>
                                                        <td>{c.platform}</td>
                                                        <td>{c.plan}</td>
                                                        <td className="mono">{c.price}</td>
                                                        <td>{c.subscription_email}</td>
                                                        <td>
                                                            <select value={c.payment_status || "Pending"} onChange={e => updateStatus(c.id, e.target.value)} style={{background:"var(--surface-alt)", color:"var(--text)", border:"1px solid var(--line)", borderRadius:"6px", padding:"4px 8px", fontSize:"0.78rem"}}>
                                                                <option value="Pending">Pending</option>
                                                                <option value="Done">Done</option>
                                                            </select>
                                                        </td>
                                                        <td>{renderRenewalCell(c.renewal_date)}</td>
                                                        <td>{c.notes}</td>
                                                        <td><button className="btn-secondary" onClick={() => deleteCustomer(c.id)} style={{padding:"6px 12px", fontSize:"0.75rem", color:"var(--danger)", borderColor:"var(--danger)"}}>Delete</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === "pricing" && (
                        <>
                            {pricingLoading ? (
                                <div id="loadingState" style={{display:"block"}}>Loading pricing data...</div>
                            ) : (
                                platforms.map(platform => (
                                    <div key={platform.id} className="panel" style={{marginBottom: "24px"}}>
                                        <h2 style={{marginBottom: "16px"}}>{platform.label} <span style={{fontSize: "0.8rem", color: "var(--muted)", fontWeight: "normal"}}>({platform.tag})</span></h2>
                                        <div className="table-scroll">
                                            <table id="customerTable">
                                                <thead>
                                                    <tr>
                                                        <th>Plan Name</th>
                                                        <th>Description</th>
                                                        <th>Price (NPR)</th>
                                                        <th>Original Price (Optional)</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {plans.filter(p => p.platform_id === platform.id).map(plan => (
                                                        <tr key={plan.id}>
                                                            <td><strong>{plan.name}</strong></td>
                                                            <td>{plan.desc}</td>
                                                            <td>
                                                                <input 
                                                                    type="number" 
                                                                    defaultValue={plan.price_npr} 
                                                                    id={`price-${plan.id}`}
                                                                    style={{width: "100px", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface-alt)", color: "var(--text)"}}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input 
                                                                    type="number" 
                                                                    defaultValue={plan.original_price_npr || ""} 
                                                                    id={`originalPrice-${plan.id}`}
                                                                    placeholder="e.g. 2999"
                                                                    style={{width: "100px", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--surface-alt)", color: "var(--text)"}}
                                                                />
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="btn" 
                                                                    style={{padding: "6px 12px", fontSize: "0.8rem"}}
                                                                    onClick={() => {
                                                                        const pVal = document.getElementById(`price-${plan.id}`).value;
                                                                        const opVal = document.getElementById(`originalPrice-${plan.id}`).value;
                                                                        updatePlanPrice(plan.id, parseInt(pVal), opVal ? parseInt(opVal) : null);
                                                                    }}
                                                                >
                                                                    Save
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {activeTab === "blog" && (
                        <>
                            <div className="panel" style={{marginBottom: "24px"}}>
                                <h2>{blogForm.id ? "Edit Blog Post" : "Create New Blog Post"}</h2>
                                <form onSubmit={handleSaveBlog}>
                                    <div className="add-grid">
                                        <div><label>Title</label><input type="text" value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})} required /></div>
                                        <div><label>Slug (URL)</label><input type="text" value={blogForm.slug} onChange={e => setBlogForm({...blogForm, slug: e.target.value})} required /></div>
                                        <div><label>Tags (comma separated)</label><input type="text" value={blogForm.tags} onChange={e => setBlogForm({...blogForm, tags: e.target.value})} /></div>
                                        <div>
                                            <label>Published Status</label>
                                            <div style={{marginTop: "8px"}}>
                                                <label style={{display: "inline-flex", alignItems: "center", cursor: "pointer"}}>
                                                    <input type="checkbox" checked={blogForm.published} onChange={e => setBlogForm({...blogForm, published: e.target.checked})} style={{width: "auto", marginRight: "8px"}} />
                                                    Publish to website
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{marginTop: "15px"}}>
                                        <label style={{display:"block", fontSize:"0.86rem", color:"var(--muted)", marginBottom:"5px"}}>Content (HTML or plain text)</label>
                                        <textarea rows="8" value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})} required style={{width:"100%", padding:"12px", background:"var(--surface-alt)", border:"1px solid var(--line)", borderRadius:"8px", color:"var(--text)", fontFamily:"'Inter'", fontSize:"0.9rem"}}></textarea>
                                    </div>
                                    <div style={{marginTop:"15px", display:"flex", gap:"10px"}}>
                                        <button type="submit" className="btn">Save Blog</button>
                                        {blogForm.id && (
                                            <button type="button" className="btn-secondary" onClick={() => setBlogForm({ id: "", slug: "", title: "", content: "", tags: "", published: false })}>Cancel Edit</button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="panel">
                                <h2>All Blog Posts</h2>
                                {blogLoading ? (
                                    <div id="loadingState" style={{display:"block"}}>Loading blogs...</div>
                                ) : blogs.length === 0 ? (
                                    <div id="emptyState" style={{display:"block"}}>No blogs created yet.</div>
                                ) : (
                                    <div className="table-scroll">
                                        <table id="customerTable">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Title</th>
                                                    <th>Slug</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {blogs.map(blog => (
                                                    <tr key={blog.id}>
                                                        <td className="mono">{new Date(blog.created_at).toLocaleDateString()}</td>
                                                        <td><strong>{blog.title}</strong></td>
                                                        <td className="mono">/blog/{blog.slug}</td>
                                                        <td>
                                                            <span style={{
                                                                padding: "4px 8px", 
                                                                borderRadius: "12px", 
                                                                fontSize: "0.75rem", 
                                                                background: blog.published ? "#eaf6e6" : "var(--surface-alt)",
                                                                color: blog.published ? "#60BB46" : "var(--muted)"
                                                            }}>
                                                                {blog.published ? "Published" : "Draft"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{display: "flex", gap: "8px"}}>
                                                                <button className="btn" style={{padding: "4px 10px", fontSize: "0.75rem"}} onClick={() => editBlog(blog)}>Edit</button>
                                                                <button className="btn-secondary" style={{padding: "4px 10px", fontSize: "0.75rem", color: "var(--danger)", borderColor: "var(--danger)"}} onClick={() => deleteBlog(blog.id)}>Delete</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
