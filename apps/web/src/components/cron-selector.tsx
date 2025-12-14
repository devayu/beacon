"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseCron,
  generateCron,
  cronDescription,
  getDaySuffix,
} from "@/lib/cron";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

interface CronSelectorProps {
  onChange?: (cronExpression: string) => void;
  defaultValue?: string;
}

export function CronSelector({
  onChange,
  defaultValue = "0 9 * * *",
}: CronSelectorProps) {
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const cronToUse = value || defaultValue;
    const parsed = parseCron(cronToUse);
    if (parsed) {
      setFrequency(parsed.frequency);
      setTime(parsed.time);
      if (parsed.dayOfWeek) setDayOfWeek(parsed.dayOfWeek);
      if (parsed.dayOfMonth) {
        setDayOfMonth(parsed.dayOfMonth);
        const newDate = new Date();
        newDate.setDate(parseInt(parsed.dayOfMonth));
        setDate(newDate);
      }
    }
  }, [defaultValue]);

  useEffect(() => {
    const cronExpression = generateCron(frequency, time, dayOfWeek, dayOfMonth);
    setValue(cronExpression);
  }, [frequency, time, dayOfWeek, dayOfMonth, onChange]);

  const getCurrentCron = () => {
    return generateCron(frequency, time, dayOfWeek, dayOfMonth);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Frequency Selector */}
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2">
            <Label htmlFor="frequency-select">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency-select">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Conditional Day Selectors */}
          {frequency === "weekly" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="day-of-week">Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="day-of-week">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="day-of-month">Day of Month</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="day-of-month"
                    className="w-full justify-between font-normal"
                  >
                    {dayOfMonth
                      ? `${dayOfMonth}${getDaySuffix(parseInt(dayOfMonth))}`
                      : "Select day"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="label"
                    hideNavigation
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                        setDayOfMonth(selectedDate.getDate().toString());
                        setOpen(false);
                      }
                    }}
                    disableNavigation
                    showOutsideDays={false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="time-picker">Time</Label>
            <Input
              type="time"
              id="time-picker"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background h-9"
            />
          </div>
        </div>
      </div>

      {/* Cron Expression Preview */}
      <div className="mt-4 p-3 bg-muted rounded-md">
        <Label className="text-sm font-medium text-muted-foreground">
          Generated Cron Expression:
        </Label>
        <code className="block mt-1 text-sm font-mono bg-background px-2 py-1 rounded">
          {getCurrentCron()}
        </code>
        <p className="text-xs text-muted-foreground mt-1">
          {cronDescription(frequency, {
            time,
            dayOfWeek,
            dayOfMonth,
          })}
        </p>
      </div>
      <Button disabled={defaultValue === value}>Update</Button>
    </div>
  );
}

// Helper function for ordinal suffixes

export default CronSelector;
