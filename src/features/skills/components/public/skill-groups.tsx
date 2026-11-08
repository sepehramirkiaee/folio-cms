import { SKILL_CATEGORY_LABELS } from "../../schemas/skill";
import type { listSkillGroups } from "../../server/public";

type Groups = Awaited<ReturnType<typeof listSkillGroups>>;

export function SkillGroups({ groups }: { groups: Groups }) {
  if (groups.length === 0) return <p className="text-muted-foreground">No skills added yet.</p>;
  return (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div key={group.category}>
          <dt className="text-sm font-medium">{SKILL_CATEGORY_LABELS[group.category]}</dt>
          <dd className="mt-1.5 leading-relaxed text-muted-foreground">{group.names.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
