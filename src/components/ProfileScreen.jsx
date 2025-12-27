// src/components/ProfileScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageNavbar from "./generic/PageNavbar.jsx";
import { getProfile, updateProfile } from "../services/profileService.jsx";
import BackArrow from "./generic/BackArrow.jsx";
import "../styles/profile.css";

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

  if (loading) {
    return (
      <div className="page">
        <div className="top-bar">
          <div className="back-btn">
            <BackArrow onClick={() => navigate("/home")}>Back</BackArrow>
          </div>
          <div style={{ opacity: 0.65, fontWeight: 800 }}>Profile</div>
        </div>
        <div className="title">Author's profile</div>
        <div className="panel">Loading...</div>
        <PageNavbar />
      </div>
    );
  }

  // ===== VIEW MODE =====
  if (!isEditing) {
    return (
      <div className="page">
        <div className="top-bar">
          <div className="back-btn">
            <BackArrow onClick={() => navigate("/home")}>Back</BackArrow>
          </div>
          <div style={{ opacity: 0.65, fontWeight: 800 }}>Profile</div>
        </div>

        <div className="title">Author's profile</div>

        <div className="section-title">Personal information</div>
        <div className="panel" style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div className="avatar-wrap">
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

        <div className="section-title">Contact</div>
        <div className="panel">
          <div className="input-like">{profile?.email}</div>
        </div>

        <div className="section-title">Bio</div>
        <div className="panel">
          <div className="input-like" style={{ minHeight: 130, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {profile?.bio}
          </div>
        </div>

        <button className="primary-big" onClick={startEdit}>
          Edit Profile
        </button>

        <PageNavbar />
      </div>
    );
  }

  // ===== EDIT MODE =====
  return (
    <div className="page">
      <div className="top-bar">
        <div className="back-btn">
          <BackArrow style={saving ? {
            opacity: 0.65,
            cursor: "not-allowed"
          } : {}} onClick={cancelEdit} disabled={saving}>Back</BackArrow>
        </div>
        <div style={{ opacity: 0.65, fontWeight: 800 }}>Edit</div>
      </div>

      <div className="title">Edit author's profile</div>

      <div className="label">Name</div>
      <input
        name="name"
        value={form.name}
        onChange={onChange}
        onBlur={onBlur}
        className="input-like"
        placeholder="Name"
      />
      {touched.name && errors.name ? <div className="error">{errors.name}</div> : null}

      <div className="label">Email</div>
      <input
        name="email"
        value={form.email}
        onChange={onChange}
        onBlur={onBlur}
        className="input-like"
        placeholder="Email"
      />
      {touched.email && errors.email ? <div className="error">{errors.email}</div> : null}

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
          className="upload-btn" style={saving ? {
            opacity: 0.65,
            cursor: "not-allowed"
          } : {}}
          disabled={saving}
        >
          Upload image
        </button>

        {form.avatarDataUrl ? (
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <div className="avatar-wrap">
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
                ...(saving ? {
                  opacity: 0.65,
                  cursor: "not-allowed"
                } : {})
              }}
              disabled={saving}
            >
              Remove
            </button>
          </div>
        ) : null}
      </div>

      <div className="label">Bio</div>
      <textarea
        name="bio"
        value={form.bio}
        onChange={onChange}
        onBlur={onBlur}
        rows={6}
        className="input-like"
        style={{ resize: "none" }}
        placeholder="Bio"
      />
      <div style={{ opacity: 0.6, fontSize: 12, marginTop: 8 }}>{(form.bio || "").length}/800</div>
      {touched.bio && errors.bio ? <div className="error">{errors.bio}</div> : null}

      <div className="btn-row">
        <button
          type="button"
          className="cancel-btn"
          style={{
            ...(saving ? {
              opacity: 0.65,
              cursor: "not-allowed"
            } : {})
          }}
          onClick={cancelEdit}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="button"
          className="confirm-btn"
          style={{
            ...(saving ? {
              opacity: 0.65,
              cursor: "not-allowed"
            } : {})
          }}
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
