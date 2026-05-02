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
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const MFA_NETWORK_FALLBACK =
  "We could not reach our servers. Check your connection and try again.";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

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

  const identifierServer = mapClerkFieldErrors(errors, "identifier");
  const passwordServer = mapClerkFieldErrors(errors, "password");
  const codeServer = mapClerkFieldErrors(errors, "code");

  const finalizeAndGoHome = useCallback(async () => {
    await signIn.finalize({
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
  }, [router, signIn]);

  const handleSubmit = async () => {
    setAttempted(true);
    setBanner(null);
    const eErr = validateEmailFormat(emailNorm);
    const pErr = validatePassword(password);
    if (eErr || pErr) return;

    try {
      const { error } = await signIn.password({
        emailAddress: emailNorm,
        password,
      });
      if (error) {
        setBanner(mapClerkApiError(error));
        return;
      }
    } catch (err) {
      setBanner(
        mapClerkApiError(
          err instanceof Error ? err : new Error("Sign-in failed"),
        ),
      );
      return;
    }

    if (signIn.status === "complete") {
      try {
        await finalizeAndGoHome();
      } catch (err) {
        setBanner(
          mapClerkApiError(
            err instanceof Error ? err : new Error("Sign-in failed"),
          ),
        );
      }
      return;
    }

    if (signIn.status === "needs_second_factor") {
      setBanner(
        "This account uses an extra sign-in step we do not support in the app yet. Sign in on the web, or contact support.",
      );
      return;
    }

    if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        try {
          const { error: sendErr } = await signIn.mfa.sendEmailCode();
          if (sendErr) {
            setBanner(mapClerkApiError(sendErr));
            return;
          }
        } catch {
          setBanner(MFA_NETWORK_FALLBACK);
          return;
        }
      } else {
        setBanner(
          "We need to verify it is really you, but this verification method is not available in the app yet.",
        );
      }
      return;
    }

    setBanner("We could not finish signing you in. Please try again.");
  };

  const handleResendMfaCode = async () => {
    setBanner(null);
    try {
      const { error: sendErr } = await signIn.mfa.sendEmailCode();
      if (sendErr) {
        setBanner(mapClerkApiError(sendErr));
      }
    } catch {
      setBanner(MFA_NETWORK_FALLBACK);
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

    try {
      const { error: verifyErr } = await signIn.mfa.verifyEmailCode({
        code: code.trim(),
      });
      if (verifyErr) {
        setBanner(mapClerkApiError(verifyErr));
        return;
      }
    } catch {
      setBanner(MFA_NETWORK_FALLBACK);
      return;
    }

    if (signIn.status === "complete") {
      try {
        await finalizeAndGoHome();
      } catch {
        setBanner(MFA_NETWORK_FALLBACK);
      }
      return;
    }

    setBanner("That code did not work. Try again or request a new code.");
  };

  if (signIn.status === "needs_client_trust") {
    return (
      <AuthScreenShell>
        <AuthBrandHeader />
        <Text className="auth-title">Check your email</Text>
        <Text className="auth-subtitle">
          We sent a verification code to {emailNorm}. Enter it below to finish
          signing in.
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
              onPress={() => void handleResendMfaCode()}
              disabled={fetchStatus === "fetching"}
            >
              <Text className="auth-secondary-button-text">
                Send a new code
              </Text>
            </Pressable>
            <Pressable
              className="auth-secondary-button"
              onPress={() => {
                setBanner(null);
                setCode("");
                signIn.reset();
              }}
            >
              <Text className="auth-secondary-button-text">Start over</Text>
            </Pressable>
          </View>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell>
      <AuthBrandHeader />
      <Text className="auth-title">Welcome back</Text>
      <Text className="auth-subtitle">
        Sign in to continue managing your subscriptions.
      </Text>
      <View className="auth-card">
        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Email</Text>
            <TextInput
              className={`auth-input ${(localEmailErr || identifierServer) ? "auth-input-error" : ""}`}
              autoCapitalize="none"
              autoCorrect={false}
              value={emailAddress}
              placeholder="Enter your email"
              placeholderTextColor="rgba(0,0,0,0.45)"
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            {(localEmailErr || identifierServer) ? (
              <Text className="auth-error">
                {localEmailErr ?? identifierServer}
              </Text>
            ) : null}
          </View>
          <View className="auth-field">
            <Text className="auth-label">Password</Text>
            <TextInput
              className={`auth-input ${(localPasswordErr || passwordServer) ? "auth-input-error" : ""}`}
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry
              onChangeText={setPassword}
              textContentType="password"
            />
            {(localPasswordErr || passwordServer) ? (
              <Text className="auth-error">
                {localPasswordErr ?? passwordServer}
              </Text>
            ) : null}
          </View>
          {banner ? <Text className="auth-error">{banner}</Text> : null}
          <AuthPrimaryButton
            label="Sign in"
            loading={fetchStatus === "fetching"}
            onPress={handleSubmit}
            disabled={!emailNorm || !password}
          />
        </View>
      </View>
      <View className="auth-link-row">
        <Text className="auth-link-copy">New to {branding.appName}? </Text>
        <Link href="/sign-up" asChild>
          <Pressable hitSlop={8}>
            <Text className="auth-link">Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
