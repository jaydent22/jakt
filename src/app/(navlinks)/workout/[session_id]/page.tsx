import { createClient } from "../../../../lib/supabase/server";

export default async function WorkoutSessionPage({
    params,
}: {
    params: { session_id: string };
}) {
    const slug = await params;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const sessionId = slug.session_id;
    
    const { data: session, error } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user?.id)
        .single();

    if (error || !session) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4 text-red-500">Workout Session Not Found</h1>
                <p className="text-foreground-muted italic">The workout session you are looking for does not exist or you do not have access to it.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Workout Session: {session.id}</h1>
            <p className="text-foreground-muted">Status: {session.status}</p>
            {/* Additional session details and workout interface can be added here */}
        </div>
    );
}