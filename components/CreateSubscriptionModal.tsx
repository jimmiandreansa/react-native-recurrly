import "@/global.css";
import { icons } from "@/constants/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

const CATEGORY_COLORS: Record<CategoryOption, string> = {
  Entertainment: "#f5c9e8",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#c4e8c2",
  Cloud: "#b8e0f0",
  Music: "#e8d4f8",
  Other: "#e2e8f0",
};

type Frequency = "Monthly" | "Yearly";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

function slugId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "subscription"}-${Date.now()}`;
}

function parsePositivePrice(raw: string): number | null {
  const normalized = raw.replace(/,/g, ".").trim();
  const n = parseFloat(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<CategoryOption>("Entertainment");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setSubmitError(null);
  }, []);

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const handleSubmit = () => {
    setSubmitError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setSubmitError("Enter a subscription name.");
      return;
    }
    const parsedPrice = parsePositivePrice(price);
    if (parsedPrice == null) {
      setSubmitError("Enter a valid price greater than zero.");
      return;
    }

    const start = dayjs();
    const startDate = start.toISOString();
    const renewalDate = start
      .add(1, frequency === "Yearly" ? "year" : "month")
      .toISOString();

    const sub: Subscription = {
      id: slugId(trimmedName),
      name: trimmedName,
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      category,
      plan: category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      color: CATEGORY_COLORS[category],
    };

    onCreate(sub);
    resetForm();
    onClose();
  };

  const canSubmit =
    name.trim().length > 0 && parsePositivePrice(price) != null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 modal-overlay"
          onPress={onClose}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          className="w-full"
        >
          <View className="modal-container w-full">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                onPress={onClose}
                className="modal-close"
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                <View className="auth-field gap-2">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    className="auth-input"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Netflix"
                    placeholderTextColor="rgba(0,0,0,0.45)"
                    autoCapitalize="sentences"
                  />
                </View>
                <View className="auth-field gap-2">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    className="auth-input"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="rgba(0,0,0,0.45)"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View className="gap-2">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    <Pressable
                      className={clsx(
                        "picker-option",
                        frequency === "Monthly" && "picker-option-active",
                      )}
                      onPress={() => setFrequency("Monthly")}
                      accessibilityRole="button"
                      accessibilityState={{ selected: frequency === "Monthly" }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Monthly" && "picker-option-text-active",
                        )}
                      >
                        Monthly
                      </Text>
                    </Pressable>
                    <Pressable
                      className={clsx(
                        "picker-option",
                        frequency === "Yearly" && "picker-option-active",
                      )}
                      onPress={() => setFrequency("Yearly")}
                      accessibilityRole="button"
                      accessibilityState={{ selected: frequency === "Yearly" }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === "Yearly" && "picker-option-text-active",
                        )}
                      >
                        Yearly
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View className="gap-2">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORY_OPTIONS.map((c) => {
                      const active = category === c;
                      return (
                        <Pressable
                          key={c}
                          className={clsx(
                            "category-chip",
                            active && "category-chip-active",
                          )}
                          onPress={() => setCategory(c)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                        >
                          <Text
                            className={clsx(
                              "category-chip-text",
                              active && "category-chip-text-active",
                            )}
                          >
                            {c}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                {submitError ? (
                  <Text className="auth-error">{submitError}</Text>
                ) : null}
                <Pressable
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canSubmit }}
                >
                  <Text className="auth-button-text">Add subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default CreateSubscriptionModal;
