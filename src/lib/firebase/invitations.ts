import { db } from "@/lib/firebase/firebase";
import { setDoc, doc, getDoc, Timestamp } from "firebase/firestore";

export type InvitationRole = "admin" | "owner" | "manager" | "CDI" | "cuisine" | "extra";

export interface Invitation {
  code: string; // 6 chiffres
  role: InvitationRole;
  createdBy: string;
  createdAt: Date;
  used: boolean;
  usedBy?: string;
  params?: Record<string, unknown>; // Pour stocker d'autres infos à attribuer au user
}

// Génère un code unique 6 chiffres
export async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const ref = doc(db, "invitations", code);
    const snap = await getDoc(ref);
    exists = snap.exists();
  } while (exists);
  return code;
}

// Crée une invitation Firestore
export async function createInvitation({
  role,
  createdBy,
  params = {},
}: {
  role: InvitationRole;
  createdBy: string;
  params?: Record<string, unknown>;
}): Promise<string> {
  const code = await generateUniqueCode();
  const ref = doc(db, "invitations", code);
  const invitationData: Record<string, unknown> = {
    code,
    role,
    createdBy,
    createdAt: Timestamp.now(),
    used: false,
  };
  if (params && Object.keys(params).length > 0) {
    invitationData.params = params;
  }
  console.log("[createInvitation] code:", code);
  console.log("[createInvitation] ref:", ref.path);
  console.log("[createInvitation] invitationData:", JSON.stringify(invitationData, null, 2));
  try {
    await setDoc(ref, invitationData);
    return code;
  } catch (error) {
    console.error("[createInvitation] Firestore error:", error);
    throw error;
  }
}

// Marque une invitation comme utilisée
export async function markInvitationUsed(code: string, userId: string) {
  const ref = doc(db, "invitations", code);
  await setDoc(ref, { used: true, usedBy: userId }, { merge: true });
}
