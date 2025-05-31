import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from '../lib/auth';
import Topbar from '../components/Topbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default function AppealReview({ user, appeals: initialAppeals }) {
  const [appeals, setAppeals] = useState(initialAppeals);
  const [loadingIds, setLoadingIds] = useState([]); // per bloccare i bottoni in update
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  async function updateStatus(id, newStatus) {
    setError(null);
    setLoadingIds((ids) => [...ids, id]);
    const { error } = await supabase
      .from("appeals")
      .update({ status: newStatus })
      .eq("id", id);
    setLoadingIds((ids) => ids.filter((x) => x !== id));
    if (error) {
      setError("Errore nell'aggiornamento dello status");
      console.error(error);
      return;
    }
    setAppeals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  }

  const canUpdate = (appeal) => appeal.status === "pending";

  return (
    <>
      <Topbar user={user} />
      <div
        style={{
          maxWidth: 900,
          margin: "48px auto",
          padding: 32,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <h1>Review Appeals</h1>
        {error && (
          <div style={{ color: "#c0392b", marginBottom: 16, fontWeight: "600" }}>
            {error}
          </div>
        )}

        {appeals.length === 0 ? (
          <p style={{ color: "#888" }}>Nessun appeal trovato.</p>
        ) : (
          appeals.map((appeal) => (
            <div
              key={appeal.id}
              style={{
                background: "#f7fafd",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                marginBottom: 18,
                padding: "20px 24px",
                position: "relative",
                cursor: "pointer",
              }}
              onClick={() => setModal(appeal)}
              title="Clicca per vedere i dettagli"
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  marginBottom: 6,
                }}
              >
                {appeal.username} (ID: {appeal.user_id})
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#555",
                  marginBottom: 8,
                  maxHeight: 40,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {appeal.appeal_text}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color:
                    appeal.status === "pending"
                      ? "#f39c12"
                      : appeal.status === "accepted"
                      ? "#27ae60"
                      : "#c0392b",
                }}
              >
                Status: {appeal.status}
              </div>

              {canUpdate(appeal) && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 12,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    disabled={loadingIds.includes(appeal.id)}
                    onClick={() => updateStatus(appeal.id, "accepted")}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 8,
                      border: "none",
                      background: "#27ae60",
                      color: "white",
                      fontWeight: "600",
                      cursor: loadingIds.includes(appeal.id) ? "not-allowed" : "pointer",
                    }}
                  >
                    {loadingIds.includes(appeal.id) ? "Loading..." : "Accept"}
                  </button>
                  <button
                    disabled={loadingIds.includes(appeal.id)}
                    onClick={() => updateStatus(appeal.id, "declined")}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 8,
                      border: "none",
                      background: "#c0392b",
                      color: "white",
                      fontWeight: "600",
                      cursor: loadingIds.includes(appeal.id) ? "not-allowed" : "pointer",
                    }}
                  >
                    {loadingIds.includes(appeal.id) ? "Loading..." : "Decline"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Modal dettagli appeal */}
        {modal && (
          <div
            onClick={() => setModal(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.25)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                borderRadius: 14,
                padding: 32,
                maxWidth: 480,
                width: "90vw",
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                position: "relative",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{modal.username}’s Appeal</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>{modal.appeal_text}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      modal.status === "pending"
                        ? "#f39c12"
                        : modal.status === "accepted"
                        ? "#27ae60"
                        : "#c0392b",
                  }}
                >
                  {modal.status}
                </span>
              </p>
              <button
                onClick={() => setModal(null)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "#eee",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps = requireAuth("admin")(async (context) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: appeals, error } = await supabase
    .from("appeals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching appeals:", error);
  }

  return {
    props: {
      user: context.req.user,
      appeals: appeals || [],
    },
  };
});
