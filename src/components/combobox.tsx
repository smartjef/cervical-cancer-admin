"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  label: string
  value: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  placeholder?: string
  emptyText?: string
  value?: string
  onValueChange?: (value: string) => void
  onSearchChange?: (search: string) => void
  isLoading?: boolean
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  placeholder = "Select option...",
  emptyText = "No option found.",
  value,
  onValueChange,
  onSearchChange,
  isLoading,
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        role="combobox"
        disabled={disabled}
        className={cn(
          "w-full justify-between border-border bg-card font-bold text-muted-foreground h-11",
          className
        )}
      >
        <span className="truncate">{placeholder}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between border-border bg-card font-bold text-muted-foreground h-11",
            className
          )}
        >
          <span className="truncate">
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-border bg-card ">
        <Command shouldFilter={!onSearchChange}>
          <CommandInput
            placeholder={placeholder}
            className="h-9"
            onValueChange={onSearchChange}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-xs font-bold text-muted-foreground animate-pulse">
                Searching...
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        const selectedOption = options.find(
                          (o) =>
                            o.value.toLowerCase() ===
                              currentValue.toLowerCase() ||
                            o.label.toLowerCase() === currentValue.toLowerCase()
                        )
                        onValueChange?.(
                          selectedOption ? selectedOption.value : currentValue
                        )
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
