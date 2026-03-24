import { NextResponse } from "next/server";
import { getChallengesService } from "../services/challengesService";
import { authenticateToken, authenticateTokenToUserId } from "../utils/authenticateToken";

// GET /challenges
export async function listChallenges(req: Request) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const challenges = await getChallengesService().listChallenges();
  return NextResponse.json({ challenges }, { status: 200 });
}

// POST /challenges (admin only, for demo allow any user)
export async function createChallenge(req: Request) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const body = await req.json();
  const result = await getChallengesService().createChallenge(body);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ challenge: result.challenge }, { status: 201 });
}

// GET /challenges/:challengeId
export async function getChallenge(req: Request, challengeId: string) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const challenge = await getChallengesService().getChallenge(challengeId);
  if (!challenge) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ challenge }, { status: 200 });
}

// POST /challenges/:challengeId/complete
export async function completeChallenge(req: Request, challengeId: string) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  const result = await getChallengesService().completeChallenge(user.userId, challengeId);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ success: true }, { status: 201 });
}

// GET /users/:userId/completed-challenges
export async function listCompletedChallenges(req: Request, userId: string) {
  const { user, error } = await authenticateToken(req);
  if (error) return error;
  // Only allow self or admin (for demo, just self)
  if (user.userId !== userId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const completed = await getChallengesService().listCompletedChallenges(userId);
  return NextResponse.json({ completed }, { status: 200 });
}