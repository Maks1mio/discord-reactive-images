export default async function (ctx, config) {
  if (!ctx.$user) {
    throw new Error(
      'Сессия не подтверждена сервером. Выйдите и войдите снова. Если недавно меняли JWT_KEY в .env — нужен новый вход.'
    )
  }

  config = {
    includeSelf: config.includeSelf || false,
    bounce: config.bounce || false,
    gapPercentage: config.gapPercentage || 0,
  }

  await ctx.query(
    `
      INSERT INTO ${ctx.tables.configs} (discord_id, include_self, bounce, gap_percentage)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (discord_id)
      DO UPDATE SET
        include_self = EXCLUDED.include_self,
        bounce = EXCLUDED.bounce,
        gap_percentage = EXCLUDED.gap_percentage
    `,
    [ctx.$user.id, config.includeSelf, config.bounce, config.gapPercentage]
  )

  ctx.setConfig(ctx.$user.id, config)

  return null
}
