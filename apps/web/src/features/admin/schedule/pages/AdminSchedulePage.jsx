import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "../../../../components/common/ConfirmationModal";
import { ErrorState } from "../../../../components/common/ErrorState";
import { LoadingState } from "../../../../components/common/LoadingState";
import { availabilityApi } from "../../../appointments/api/availability.api.js";
import { SchedulePreviewGrid, buildTimeRows } from "../components/SchedulePreviewGrid";
import { ScheduleRuleForm } from "../components/ScheduleRuleForm";
import { ScheduleRulesList } from "../components/ScheduleRulesList";
import { RESET_DEFAULTS, WEEK_ORDER, createSlotsForRule, getWeekDates } from "../utils/scheduleUtils";

const schema = z.object({
  dayOfWeek: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  slotDurationMinutes: z.coerce.number().min(5, "Duration must be positive"),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
  isActive: z.boolean().optional()
});

export default function AdminSchedulePage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const {
    data: availabilityData,
    isLoading,
    isError: availabilityError,
    refetch: refetchAvailability
  } = useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const response = await availabilityApi.getAll();
      return response.data?.data ?? [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await availabilityApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await availabilityApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await availabilityApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: RESET_DEFAULTS
  });

  const rules = useMemo(
    () => (Array.isArray(availabilityData) ? availabilityData : []).filter((rule) => rule.isActive),
    [availabilityData]
  );
  const selectedDay = form.watch("dayOfWeek");
  const selectedDays = useMemo(() => {
    if (!selectedDay) return [];
    if (selectedDay === "weekdays") return ["monday", "tuesday", "wednesday", "thursday", "friday"];
    if (selectedDay === "weekends") return ["saturday", "sunday"];
    return [selectedDay];
  }, [selectedDay]);

  const weekDates = useMemo(() => getWeekDates(new Date()), []);

  const dayRuleMap = useMemo(() => {
    const map = {};
    WEEK_ORDER.forEach((day) => {
      map[day] = rules.find((rule) => rule.dayOfWeek === day) || null;
    });
    return map;
  }, [rules]);

  const timeRows = useMemo(() => buildTimeRows(dayRuleMap), [dayRuleMap]);

  const slotsByDay = useMemo(() => {
    const map = {};
    WEEK_ORDER.forEach((day) => {
      const rule = dayRuleMap[day];
      map[day] = rule ? createSlotsForRule(rule) : [];
    });
    return map;
  }, [dayRuleMap]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      isActive: values.isActive ?? true
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: payload });
      setEditingId("");
    } else {
      await createMutation.mutateAsync(payload);
    }

    form.reset(RESET_DEFAULTS);
  };

  const resetDraft = () => {
    setEditingId("");
    form.reset(RESET_DEFAULTS);
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState label="Loading availability rules..." />
      </div>
    );
  }

  if (availabilityError) {
    return (
      <ErrorState
        title="Unable to load schedule rules"
        description="Please retry to fetch availability rules."
        onRetry={refetchAvailability}
      />
    );
  }

  const weekLabel = `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "2-digit" })} - ${weekDates[6].toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  })}`;

  return (
    <div className="min-h-screen bg-[#F8FAF8] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 font-headline text-3xl font-bold tracking-tight text-[#005235] sm:text-4xl">Schedule Control</h1>
          <p className="max-w-xl text-[#3F4943]">
            Configure system-wide availability rules, slot intervals, and emergency block-outs for the clinical departments.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-3 rounded-xl bg-[#F2F4F2] px-4 py-2">
          <span className="material-symbols-outlined text-[#005235]">calendar_month</span>
          <span className="text-sm font-medium">{weekLabel}</span>
        </div>
      </header>

      <div className="flex flex-col items-start gap-6 xl:flex-row xl:gap-8">
        <section className="w-full space-y-6 xl:w-[380px] xl:flex-shrink-0 xl:space-y-8">
          <ScheduleRuleForm
            form={form}
            selectedDays={selectedDays}
            editingId={editingId}
            createMutation={createMutation}
            updateMutation={updateMutation}
            onSubmit={onSubmit}
            resetDraft={resetDraft}
          />

          <ScheduleRulesList rules={rules} form={form} setEditingId={setEditingId} setDeleteId={setDeleteId} />
        </section>

        <SchedulePreviewGrid
          rules={rules}
          weekDates={weekDates}
          dayRuleMap={dayRuleMap}
          slotsByDay={slotsByDay}
          timeRows={timeRows}
          resetDraft={resetDraft}
          queryClient={queryClient}
          mutationsPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
        />
      </div>

      <ConfirmationModal
        open={Boolean(deleteId)}
        title="Delete availability rule"
        message="Are you sure you want to delete this rule? This action cannot be undone."
        confirmLabel="Delete Rule"
        cancelLabel="Cancel"
        loading={deleteMutation.isPending}
        variant="danger"
        onCancel={() => setDeleteId("")}
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMutation.mutateAsync(deleteId);
          setDeleteId("");
        }}
      />
    </div>
  );
}
