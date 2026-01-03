import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNavbar from "./generic/PageNavbar.jsx";
import { getProfile, updateProfile } from "../services/profileService.jsx";
import "../styles/profile.css";

// Валідація форми
function validate(form) {
  const errors = {};
  if (!form.name?.trim()) errors.name = "Name is required.";
  if (!form.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Email is not valid.";
  }
  if (form.bio && form.bio.length > 800) {
    errors.bio = "Bio must be max 800 characters.";
  }
  return errors;
}

// Конвертація файлу в base64
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // ЛОГІКА ЗАВДАННЯ №59: Перевіряємо, чи ми на сторінці автора
  const isAuthorView = window.location.pathname.includes("author");

  // Стейт
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    avatarDataUrl: ""
  });
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => validate(form), [form]);

  // Завантаження профілю
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const p = await getProfile();
        if (!mounted) return;
        setProfile(p);
        setForm({
          name: p?.name ?? "",
          email: p?.email ?? "",
          bio: p?.bio ?? "",
          avatarDataUrl: p?.avatarDataUrl ?? ""
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  // Обробники подій
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const startEdit = () => {
    setTouched({});
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (!profile) return;
    setTouched({});
    setForm({
      name: profile.name ?? "",
      email: profile.email ?? "",
      bio: profile.bio ?? "",
      avatarDataUrl: profile.avatarDataUrl ?? ""
    });
    setIsEditing(false);
  };

  const confirmEdit = async () => {
    setTouched({ name: true, email: true, bio: true });
    if (Object.keys(validate(form)).length > 0) return;

    setSaving(true);

    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        bio: form.bio,
        avatarDataUrl: form.avatarDataUrl
      });

      setProfile({ ...profile, ...updated });
      setIsEditing(false);

    } finally {
      setSaving(false);
    }
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm(prev => ({ ...prev, avatarDataUrl: dataUrl }));
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  // ОБ'ЄКТ СТИЛІВ
  const s = {
    page: { minHeight: "100vh", padding: "22px 18px 140px", color: "#fff", background: "var(--app-bg, #1b3b53)" },
    topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 },
    backBtn: { padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", fontWeight: 800 },
    title: { fontSize: 40, fontWeight: 900, margin: "10px 0 18px", letterSpacing: -0.4 },
    sectionTitle: { fontSize: 20, fontWeight: 900, margin: "18px 0 12px" },
    panel: { background: "rgba(6, 38, 61, 0.70)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16, boxShadow: "0 10px 26px rgba(0,0,0,0.25)" },
    input: { width: "100%", padding: "14px 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none", fontSize: 16 },
    label: { fontSize: 16, fontWeight: 900, margin: "18px 0 10px" },
    error: { color: "#ff8c8c", fontSize: 13, marginTop: 8 },
    avatarWrap: { width: 74, height: 74, borderRadius: "50%", border: "2px solid rgba(46, 126, 183, 0.55)", display: "grid", placeItems: "center", overflow: "hidden", background: "rgba(0,0,0,0.15)" },
    primaryBtn: { width: "100%", padding: "16px 18px", borderRadius: 18, border: "none", background: "#ffffff", color: "#0b2540", fontSize: 18, fontWeight: 900, cursor: "pointer", marginTop: 18 },
    uploadBtn: { width: "100%", padding: "16px 18px", borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#a8d7ff", fontWeight: 900, cursor: "pointer" },
    btnRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 },
    cancelBtn: { padding: "16px 18px", borderRadius: 18, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255, 68, 68, 0.16)", color: "#ffd6d6", fontWeight: 900, cursor: "pointer" },
    confirmBtn: { padding: "16px 18px", borderRadius: 18, border: "none", background: "#ffffff", color: "#0b2540", fontWeight: 900, cursor: "pointer" },
    disabled: { opacity: 0.6, cursor: "not-allowed" }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.topBar}><button style={s.backBtn} onClick={() => navigate("/home")}>Back</button></div>
        <div style={s.title}>Loading profile...</div>
        <PageNavbar />
      </div>
    );
  }

  // ===== VIEW MODE =====
  if (!isEditing) {
    return (
      <div style={s.page}>
        <div style={s.topBar}>
          <button style={s.backBtn} onClick={() => navigate("/home")}>Back</button>
          <div style={{ opacity: 0.65, fontWeight: 800 }}>
             {/* Змінюємо заголовок в шапці */}
             {isAuthorView ? "Author Profile" : "My Profile"}
          </div>
        </div>

        {/* Змінюємо головний заголовок */}
        <div style={s.title}>{isAuthorView ? "Author details" : "My profile"}</div>

        <div style={s.sectionTitle}>Personal information</div>
        <div style={{ ...s.panel, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={s.avatarWrap}>
            {profile?.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : <div style={{ fontSize: 30, opacity: 0.65 }}>👤</div>}
          </div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.65 }}>Name</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{profile?.name}</div>
          </div>
        </div>

        <div style={s.sectionTitle}>Contact</div>
        <div style={s.panel}><div style={s.input}>{profile?.email}</div></div>

        <div style={s.sectionTitle}>Bio</div>
        <div style={s.panel}>
          <div style={{ ...s.input, minHeight: 130, whiteSpace: "pre-wrap" }}>{profile?.bio}</div>
        </div>

        {/* ГОЛОВНА ЗМІНА: Кнопка редагування зникає, якщо це автор */}
        {!isAuthorView && (
          <button style={s.primaryBtn} onClick={startEdit}>Edit Profile</button>
        )}

        <PageNavbar />
      </div>
    );
  }

  // ===== EDIT MODE (Тільки для власника) =====
  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={{ ...s.backBtn, ...(saving && s.disabled) }} onClick={cancelEdit} disabled={saving}>Back</button>
        <div style={{ opacity: 0.65, fontWeight: 800 }}>Edit Mode</div>
      </div>

      <div style={s.title}>Edit Profile</div>

      <div style={s.label}>Name</div>
      <input name="name" value={form.name} onChange={onChange} onBlur={onBlur} style={s.input} />
      {touched.name && errors.name && <div style={s.error}>{errors.name}</div>}

      <div style={s.label}>Email</div>
      <input name="email" value={form.email} onChange={onChange} onBlur={onBlur} style={s.input} />
      {touched.email && errors.email && <div style={s.error}>{errors.email}</div>}

      <div style={{ marginTop: 24 }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: "none" }} />
        <button style={s.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={saving}>Upload New Image</button>

        {form.avatarDataUrl && (
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={s.avatarWrap}>
              <img src={form.avatarDataUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <button onClick={() => setForm(p => ({ ...p, avatarDataUrl: "" }))} style={{ color: "#ff8c8c", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Remove</button>
          </div>
        )}
      </div>

      <div style={s.label}>Bio</div>
      <textarea name="bio" value={form.bio} onChange={onChange} onBlur={onBlur} rows={6} style={{ ...s.input, resize: "none" }} />
      <div style={{ opacity: 0.5, fontSize: 12, marginTop: 8 }}>{form.bio.length}/800</div>
      {touched.bio && errors.bio && <div style={s.error}>{errors.bio}</div>}

      <div style={s.btnRow}>
        <button style={s.cancelBtn} onClick={cancelEdit} disabled={saving}>Cancel</button>
        <button style={s.confirmBtn} onClick={confirmEdit} disabled={saving}>{saving ? "Saving..." : "Confirm Changes"}</button>
      </div>

      <PageNavbar />
    </div>
  );
}
