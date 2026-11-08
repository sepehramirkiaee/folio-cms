"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProjectOrder, useReorderProjects } from "../hooks/use-projects";
import { PROJECT_STATUS_LABELS, type ProjectOrderItem } from "../schemas/project";

function SortableProject({ project, index }: { project: ProjectOrderItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3",
        isDragging && "relative z-10 shadow-lg ring-2 ring-ring",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        aria-label={`Reorder ${project.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <span className="w-6 text-right text-sm text-muted-foreground tabular-nums">{index + 1}</span>
      <span className="flex-1 truncate font-medium">{project.title}</span>
      {project.featured && (
        <Star
          className="size-3.5 fill-current text-amber-600 dark:text-amber-400"
          aria-label="Featured"
        />
      )}
      <Badge variant={project.status === "PUBLISHED" ? "default" : "outline"}>
        {PROJECT_STATUS_LABELS[project.status]}
      </Badge>
    </li>
  );
}

export function ProjectReorderList() {
  const { data: projects, isPending, isError } = useProjectOrder();
  const reorder = useReorderProjects();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (isPending) {
    return (
      <div className="space-y-2" aria-busy>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (isError) return <p className="text-destructive">Could not load projects.</p>;
  if (projects.length === 0) return <p className="text-muted-foreground">No projects yet.</p>;

  const titleOf = (id: string | number) => projects.find((p) => p.id === id)?.title ?? "Project";
  const positionOf = (id: string | number) => projects.findIndex((p) => p.id === id) + 1;

  // Spoken by screen readers while dragging with the keyboard.
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Picked up ${titleOf(active.id)}, position ${positionOf(active.id)} of ${projects.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)} moved to position ${positionOf(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} dropped at position ${positionOf(over.id)}.`
        : `${titleOf(active.id)} dropped.`,
    onDragCancel: ({ active }) => `Reordering cancelled. ${titleOf(active.id)} was not moved.`,
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = projects.findIndex((p) => p.id === active.id);
    const to = projects.findIndex((p) => p.id === over.id);
    reorder.mutate(arrayMove(projects, from, to), {
      onError: (error) => toast.error(`Order not saved. ${error.message}`),
    });
  };

  return (
    <div className="space-y-3">
      <p id="reorder-help" className="text-sm text-muted-foreground">
        Drag projects by the handle, or focus a handle and press Space, then the arrow keys, then
        Space again. This order is used on the public site. Changes save automatically.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              "To reorder, press Space to pick up the project, use the arrow keys to move it, and press Space to drop it, or Escape to cancel.",
          },
        }}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2" aria-describedby="reorder-help">
            {projects.map((project, index) => (
              <SortableProject key={project.id} project={project} index={index} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}
