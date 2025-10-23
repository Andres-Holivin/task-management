import React, { use, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import momen from "moment"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import moment from "moment"
interface DatePickerProps {
    defaultValue?: Date
    onChange: (date: Date | undefined) => void
    placeholder?: string
    disablePastDates?: boolean
}
export function DatePicker({ defaultValue, onChange, placeholder = "Pick a date", disablePastDates }: Readonly<DatePickerProps>) {
    const [date, setDate] = React.useState<Date | undefined>(defaultValue)
    const [isOpen, setIsOpen] = React.useState(false)

    function onDateSelect(selectedDate: Date | undefined) {
        setDate(selectedDate)
        onChange(selectedDate)
        setIsOpen(false)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!date}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                >
                    <CalendarIcon />
                    {date ? momen(date).format("MMM D, YYYY") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode={"single"} selected={date} onSelect={onDateSelect} captionLayout="dropdown"  disabled={disablePastDates ? { before: moment().startOf('day').toDate() } : undefined} />
            </PopoverContent>
        </Popover>
    )
}

export function DatePickerWithTime({ defaultValue, onChange, placeholder = "Pick date & time", disablePastDates }: Readonly<DatePickerProps>) {
    const [date, setDate] = React.useState<Date | undefined>()
    const [isOpen, setIsOpen] = React.useState(false)
    useEffect(() => {
        setDate(defaultValue)
    }, [defaultValue])
    function onDateSelect(selectedDate: Date | undefined) {
        setDate(selectedDate)
        onChange(selectedDate)
    }
    function handleTimeChange(type: "hour" | "minute", value: string) {
        if (!date) {
            return
        }
        const newDate = moment(date).toDate()
        if (type === "hour") {
            newDate.setHours(Number.parseInt(value, 10))
        } else if (type === "minute") {
            newDate.setMinutes(Number.parseInt(value, 10))
        }
        setDate(newDate)
        onChange(newDate)
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button

                    variant="outline"
                    data-empty={!date}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                >
                    <CalendarIcon />
                    {date ? momen(date).format("MMM D, YYYY, HH:mm") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
                <div className="sm:flex">
                    <Calendar mode={"single"} selected={date} onSelect={onDateSelect} captionLayout="dropdown" disabled={disablePastDates ? { before: moment().startOf('day').toDate() } : undefined} />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 24 }, (_, i) => i)
                                    .map((hour) => (
                                        <Button
                                            key={hour}
                                            size="icon"
                                            disabled={disablePastDates && date ? moment(date).isSame(moment(), 'day') && hour < moment().hour() : false}
                                            variant={
                                                date && date.getHours() === hour
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() =>
                                                handleTimeChange("hour", hour.toString())
                                            }
                                        >
                                            {hour}
                                        </Button>
                                    ))}
                            </div>
                            <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                            />
                        </ScrollArea>
                        <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                    (minute) => (
                                        <Button
                                            key={minute}
                                            size="icon"
                                            disabled={disablePastDates && date ? moment(date).isSame(moment(), 'day') && date.getHours() === moment().hour() && minute < moment().minute() : false}
                                            variant={
                                                date && date.getMinutes() === minute
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            className="sm:w-full shrink-0 aspect-square"
                                            onClick={() =>
                                                handleTimeChange("minute", minute.toString())
                                            }
                                        >
                                            {minute.toString().padStart(2, "0")}
                                        </Button>
                                    )
                                )}
                            </div>
                            <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                            />
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}