import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ cards: getStore().cards });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const store = getStore();
  const body = await req.json().catch(() => null);
  const { cardId, action, value } = body ?? {
    cardId: undefined,
    action: undefined,
    value: undefined,
  };

  const card = store.cards.find((c) => c.id === cardId);
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  switch (action) {
    case "freeze":
      card.frozen = true;
      break;
    case "unfreeze":
      card.frozen = false;
      break;
    case "limit": {
      const v = Number(value);
      if (!v || Number.isNaN(v) || v < 10 || v > 5000) {
        return NextResponse.json(
          { error: "Daily limit must be between $10 and $5,000." },
          { status: 400 }
        );
      }
      card.dailyLimit = v;
      break;
    }
    case "international":
      card.international = Boolean(value);
      break;
    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  return NextResponse.json({ cards: store.cards });
}
