import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d";
import { useAddClient } from "../hooks/useQueries";

interface ClientFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<Client>;
}

export default function ClientForm({ onSuccess }: ClientFormProps) {
  const addClient = useAddClient();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    instagram: "",
    email: "",
    clientType: "Individual",
    favoriteFlowers: "",
    favoriteTruffles: "",
    importantDates: "",
    notes: "",
    isVip: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClient.mutateAsync(form);
      toast.success("Client added successfully");
      onSuccess?.();
    } catch {
      toast.error("Failed to add client");
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="firstName"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            First Name
          </Label>
          <Input
            id="firstName"
            data-ocid="client_form.first_name.input"
            placeholder="Ana"
            required
            {...field("firstName")}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="lastName"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Last Name
          </Label>
          <Input
            id="lastName"
            data-ocid="client_form.last_name.input"
            placeholder="Petrova"
            required
            {...field("lastName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="phone"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Phone
          </Label>
          <Input id="phone" placeholder="07X XXX XXX" {...field("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="instagram"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Instagram
          </Label>
          <Input
            id="instagram"
            placeholder="@username"
            {...field("instagram")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="ana@example.com"
          {...field("email")}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
          Client Type
        </Label>
        <Select
          value={form.clientType}
          onValueChange={(v) => setForm((prev) => ({ ...prev, clientType: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Individual">Individual</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="favoriteFlowers"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Favourite Flowers
          </Label>
          <Input
            id="favoriteFlowers"
            placeholder="Roses, Lavender"
            {...field("favoriteFlowers")}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="favoriteTruffles"
            className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            Favourite Sweets
          </Label>
          <Input
            id="favoriteTruffles"
            placeholder="Lavender Truffles"
            {...field("favoriteTruffles")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="importantDates"
          className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
        >
          Important Dates
        </Label>
        <Input
          id="importantDates"
          placeholder="Birthday: 12 March, Anniversary: 7 April"
          {...field("importantDates")}
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="notes"
          className="text-xs font-medium tracking-wider uppercase text-muted-foreground"
        >
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any special preferences or notes..."
          rows={3}
          {...field("notes")}
        />
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/40">
        <Checkbox
          id="isVip"
          checked={form.isVip}
          onCheckedChange={(checked) =>
            setForm((prev) => ({ ...prev, isVip: checked === true }))
          }
        />
        <Label htmlFor="isVip" className="text-sm font-medium cursor-pointer">
          Mark as VIP Client
        </Label>
      </div>

      <Button
        type="submit"
        data-ocid="client_form.submit_button"
        disabled={addClient.isPending}
        className="w-full min-h-[44px]"
      >
        {addClient.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Client"
        )}
      </Button>
    </form>
  );
}
