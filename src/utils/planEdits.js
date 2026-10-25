// Locate the originally edited block in the fresh transaction snapshot. New
// blocks have IDs; old saved plans fall back to a checked position and exercise.
export function editPlanBlock(day, expected, index, transform) {
  const blocks = day.blocks || [];
  const actualIndex = expected.id ? blocks.findIndex(block => block.id === expected.id) : index;
  if (actualIndex < 0 || !blocks[actualIndex] || blocks[actualIndex].exerciseId !== expected.exerciseId) {
    throw new Error('The exercise changed; reload before editing it.');
  }
  return { blocks: transform(blocks, actualIndex) };
}
