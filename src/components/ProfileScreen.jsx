// src/components/ProfileScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNavbar from "./generic/PageNavbar.jsx";
import { getProfile, updateProfile } from "../services/profileService.jsx";

function validate(form) {
  const errors = {};

  if (!form.name?.trim()) errors.name = "Name is required.";
  if (!form.email?.trim()) errors.email = "Email is required.";
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Email is not valid.";

  if (form.bio && form.bio.length > 800) errors.bio = "Bio must be max 800 characters.";

  return errors;
}

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
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const p = await getProfile();
        if (!mounted) return;

        setProfile(p);
        setForm({
          name: p.name ?? "",
          email: p.email ?? "",
          bio: p.bio ?? "",
          avatarDataUrl: p.avatarDataUrl ?? ""
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function startEdit() {
    setTouched({});
    setIsEditing(true);
  }

  function cancelEdit() {
    if (!profile) return;
    setTouched({});
    setForm({
      name: profile.name ?? "",
      email: profile.email ?? "",
      bio: profile.bio ?? "",
      avatarDataUrl: profile.avatarDataUrl ?? ""
    });
    setIsEditing(false);
  }

  async function confirmEdit() {
    setTouched({ name: true, email: true, bio: true });
    const currentErrors = validate(form);
    if (Object.keys(currentErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        bio: form.bio,
        avatarDataUrl: form.avatarDataUrl
      });
      setProfile(updated);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function onPickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, avatarDataUrl: dataUrl }));
  }

  // ===== UI styles (matching your app feel + keeps background consistent) =====
  const page = {
    minHeight: "100vh",
    padding: "22px 18px 140px", // space for bottom navbar
    color: "#fff",
    background: "var(--app-bg, #1b3b53)" // SAME background across pages if you define --app-bg globally
  };

  const topBar = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10
  };

  const backBtn = {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800
  };

  const title = { fontSize: 40, fontWeight: 900, margin: "10px 0 18px", letterSpacing: -0.4 };
  const sectionTitle = { fontSize: 20, fontWeight: 900, margin: "18px 0 12px" };

  const panel = {
    background: "rgba(6, 38, 61, 0.70)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 26px rgba(0,0,0,0.25)"
  };

  const inputLike = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    outline: "none",
    fontSize: 16
  };

  const label = { fontSize: 16, fontWeight: 900, margin: "18px 0 10px" };
  const error = { color: "rgba(255,140,140,0.95)", fontSize: 13, marginTop: 8 };

  const avatarWrap = {
    width: 74,
    height: 74,
    borderRadius: "999px",
    border: "2px solid rgba(46, 126, 183, 0.55)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    background: "rgba(0,0,0,0.15)",
    boxShadow: "0 10px 18px rgba(0,0,0,0.25)"
  };

  const primaryBig = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 18,
    border: "none",
    background: "#ffffff",
    color: "#0b2540",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 18,
    boxShadow: "0 14px 24px rgba(0,0,0,0.28)"
  };

  const uploadBtn = {
    width: "100%",
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#a8d7ff",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer"
  };

  const btnRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 };

  const cancelBtn = {
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255, 68, 68, 0.16)",
    color: "#ffd6d6",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer"
  };

  const confirmBtn = {
    padding: "16px 18px",
    borderRadius: 18,
    border: "none",
    background: "#ffffff",
    color: "#0b2540",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 24px rgba(0,0,0,0.28)"
  };

  const disabledStyle = { opacity: 0.65, cursor: "not-allowed" };

  if (loading) {
    return (
      <div style={page}>
        <div style={topBar}>
          <button style={backBtn} onClick={() => navigate("/home")}>Back</button>
          <div style={{ opacity: 0.65, fontWeight: 800 }}>Profile</div>
        </div>
        <div style={title}>Author's profile</div>
        <div style={panel}>Loading...</div>
        <PageNavbar />
      </div>
    );
  }

  // ===== VIEW MODE =====
  if (!isEditing) {
    return (
      <div style={page}>
        <div style={topBar}>
          <button style={backBtn} onClick={() => navigate("/home")}>Back</button>
          <div style={{ opacity: 0.65, fontWeight: 800 }}>Profile</div>
        </div>

        <div style={title}>Author's profile</div>

        <div style={sectionTitle}>Personal information</div>
        <div style={{ ...panel, display: "flex", gap: 14, alignItems: "center" }}>
          <div style={avatarWrap}>
            {profile?.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ fontSize: 30, opacity: 0.65 }}>👤</div>
            )}
          </div>

          <div style={{ lineHeight: 1.45 }}>
            <div style={{ fontSize: 16, opacity: 0.65 }}>Name</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{profile?.name}</div>
          </div>
        </div>

        <div style={sectionTitle}>Contact</div>
        <div style={panel}>
          <div style={inputLike}>{profile?.email}</div>
        </div>

        <div style={sectionTitle}>Bio</div>
        <div style={panel}>
          <div style={{ ...inputLike, minHeight: 130, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {profile?.bio}
          </div>
        </div>

        <button style={primaryBig} onClick={startEdit}>
          Edit Profile
        </button>

        <PageNavbar />
      </div>
    );
  }

  // ===== EDIT MODE =====
  return (
    <div style={page}>
      <div style={topBar}>
        <button style={{ ...backBtn, ...(saving ? disabledStyle : {}) }} onClick={cancelEdit} disabled={saving}>
          Back
        </button>
        <div style={{ opacity: 0.65, fontWeight: 800 }}>Edit</div>
      </div>

      <div style={title}>Edit author's profile</div>

      <div style={label}>Name</div>
      <input
        name="name"
        value={form.name}
        onChange={onChange}
        onBlur={onBlur}
        style={inputLike}
        placeholder="Name"
      />
      {touched.name && errors.name ? <div style={error}>{errors.name}</div> : null}

      <div style={label}>Email</div>
      <input
        name="email"
        value={form.email}
        onChange={onChange}
        onBlur={onBlur}
        style={inputLike}
        placeholder="Email"
      />
      {touched.email && errors.email ? <div style={error}>{errors.email}</div> : null}

      <div style={{ marginTop: 18 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPickImage}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{ ...uploadBtn, ...(saving ? disabledStyle : {}) }}
          disabled={saving}
        >
          Upload image
        </button>

        {form.avatarDataUrl ? (
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={avatarWrap}>
              <img
                src={form.avatarDataUrl}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, avatarDataUrl: "" }))}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 900,
                ...(saving ? disabledStyle : {})
              }}
              disabled={saving}
            >
              Remove
            </button>
          </div>
        ) : null}
      </div>

      <div style={label}>Bio</div>
      <textarea
        name="bio"
        value={form.bio}
        onChange={onChange}
        onBlur={onBlur}
        rows={6}
        style={{ ...inputLike, resize: "none" }}
        placeholder="Bio"
      />
      <div style={{ opacity: 0.6, fontSize: 12, marginTop: 8 }}>{(form.bio || "").length}/800</div>
      {touched.bio && errors.bio ? <div style={error}>{errors.bio}</div> : null}

      <div style={btnRow}>
        <button
          type="button"
          style={{ ...cancelBtn, ...(saving ? disabledStyle : {}) }}
          onClick={cancelEdit}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="button"
          style={{ ...confirmBtn, ...(saving ? disabledStyle : {}) }}
          onClick={confirmEdit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Confirm"}
        </button>
      </div>

      <PageNavbar />
    </div>
  );
}
