import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthScreenShell } from "@/components/auth/AuthScreenShell";
import { branding } from "@/constants/branding";
import { mapClerkApiError, mapClerkFieldErrors } from "@/lib/auth/errors";
import { navigateAfterAuthSession } from "@/lib/auth/navigateAfterAuth";
import {
  normalizeEmail,
  validateEmailFormat,
  validatePassword,
  validateVerificationCode,
} from "@/lib/auth/validation";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUpScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const emailNorm = normalizeEmail(emailAddress);
  const localEmailErr =
    attempted || emailAddress.length > 0
      ? validateEmailFormat(emailNorm)
      : undefined;
  const localPasswordErr =
    attempted || password.length > 0
      ? validatePassword(password)
      : undefined;

  const emailServer = mapClerkFieldErrors(errors, "emailAddress");
  const passwordServer = mapClerkFieldErrors(errors, "password");
  const codeServer = mapClerkFieldErrors(errors, "code");

  const finalizeAndGoHome = useCallback(async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          Alert.alert(
            "One more step",
            "Your account needs a quick update before you can continue.",
          );
          return;
        }
        navigateAfterAuthSession(router, decorateUrl);
      },
    });
  }, [router, signUp]);

  const handleSubmit = async () => {
    setAttempted(true);
    setBanner(null);
    const eErr = validateEmailFormat(emailNorm);
    const pErr = validatePassword(password);
    if (eErr || pErr) return;

    const { error } = await signUp.password({
      emailAddress: emailNorm,
      password,
    });
    if (error) {
      setBanner(mapClerkApiError(error));
      return;
    }

    const { error: sendErr } = await signUp.verifications.sendEmailCode();
    if (sendErr) {
      setBanner(mapClerkApiError(sendErr));
    }
  };

  const handleVerify = async () => {
    setAttempted(true);
    setBanner(null);
    const cErr = validateVerificationCode(code);
    if (cErr) {
      setBanner(cErr);
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });
    if (error) {
      setBanner(mapClerkApiError(error));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeAndGoHome();
      return;
    }

    setBanner("We could not verify that code. Try again or request a new one.");
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const showVerify =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  if (showVerify) {
    return (
      <AuthScreenShell>
        <AuthBrandHeader />
        <Text className="auth-title">Check your email</Text>
        <Text className="auth-subtitle">
          We sent a short code to {emailNorm}. Enter it below to activate your
          account and start tracking renewals.
        </Text>
        <View className="auth-card">
          <View className="auth-form">
            <View className="auth-field">
              <Text className="auth-label">Verification code</Text>
              <TextInput
                className={`auth-input ${(codeServer || (attempted && validateVerificationCode(code))) ? "auth-input-error" : ""}`}
                value={code}
                placeholder="Enter the code"
                placeholderTextColor="rgba(0,0,0,0.45)"
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {(codeServer || (attempted && validateVerificationCode(code))) ? (
                <Text className="auth-error">
                  {codeServer ?? validateVerificationCode(code)}
                </Text>
              ) : null}
            </View>
            {banner ? <Text className="auth-error">{banner}</Text> : null}
            <AuthPrimaryButton
              label="Verify and continue"
              loading={fetchStatus === "fetching"}
              onPress={handleVerify}
            />
            <Pressable
              className="auth-secondary-button"
              onPress={() => signUp.verifications.sendEmailCode()}
              disabled={fetchStatus === "fetching"}
            >
              <Text className="auth-secondary-button-text">
                Send a new code
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="auth-link-row">
          <Text className="auth-link-copy">Wrong email? </Text>
          <Pressable hitSlop={8} onPress={() => signUp.reset()}>
            <Text className="auth-link">Go back</Text>
          </Pressable>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <AuthBrandHeader />
      <Text className="auth-title">Create your account</Text>
      <Text className="auth-subtitle">
        Join {branding.appName} to see renewals, spending, and what is due next,
        in one calm place.
      </Text>
      <View className="auth-card">
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={`auth-input ${(localEmailErr || emailServer) ? "auth-input-error" : ""}`}
              autoCapitalize="none"
              autoCorrect={false}
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor="rgba(0,0,0,0.45)"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            {(localEmailErr || emailServer) ? (
              <Text className="auth-error">
                {localEmailErr ?? emailServer}
              </Text>
            ) : null}
          </View>
          <View className="auth-field">
            <Text className="auth-label">Password</Text>
            <TextInput
              className={`auth-input ${(localPasswordErr || passwordServer) ? "auth-input-error" : ""}`}
              value={password}
              placeholder="Create a password"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry
              onChangeText={setPassword}
              textContentType="newPassword"
            />
            {(localPasswordErr || passwordServer) ? (
              <Text className="auth-error">
                {localPasswordErr ?? passwordServer}
              </Text>
            ) : null}
            <Text className="auth-helper">
              At least 8 characters. Avoid passwords you use on other sites.
            </Text>
          </View>
          {banner ? <Text className="auth-error">{banner}</Text> : null}
          <AuthPrimaryButton
            label="Continue"
            loading={fetchStatus === "fetching"}
            onPress={handleSubmit}
            disabled={!emailNorm || !password}
          />
          <View nativeID="clerk-captcha" />
        </View>
      </View>
      <View className="auth-link-row">
        <Text className="auth-link-copy">Already have an account? </Text>
        <Link href="/sign-in" asChild>
          <Pressable hitSlop={8}>
            <Text className="auth-link">Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
