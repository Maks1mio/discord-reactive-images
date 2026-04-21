export default async function(ctx) {
  if (!ctx.$user) throw new Error('Must be logged in')

  const { results } = await ctx.query(`SELECT * FROM ${ctx.tables.configs} WHERE discord_id = $1`, [ctx.$user.id])
  const config = results && results.length ? results[0] : {}

  return {
    includeSelf: !!config.include_self || false,
    bounce: !!config.bounce || false,
    gapPercentage: +config.gap_percentage || 0,
  }
}
