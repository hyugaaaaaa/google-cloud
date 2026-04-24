import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type PushSubscriptionPayload = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const body = (await request.json()) as { subscription?: PushSubscriptionPayload }
  const subscription = body.subscription

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: request.headers.get('user-agent') || null,
      },
      {
        onConflict: 'endpoint',
      },
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from('profiles')
    .update({ push_opt_in: true })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const body = (await request.json()) as { endpoint?: string }

  if (!body.endpoint) {
    return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', body.endpoint)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { count } = await supabase
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!count) {
    await supabase
      .from('profiles')
      .update({ push_opt_in: false })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
