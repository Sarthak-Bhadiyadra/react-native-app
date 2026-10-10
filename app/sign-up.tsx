import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import images from "@/constants/images";
import { posthog } from "@/lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUp() {
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const router = useRouter();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  // Email verification (OTP) step
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"form" | "verify">("form");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setLoading(true);

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      if (signUpError) {
        setError(signUpError.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // If sign-up is already complete (e.g. email verification not required),
      // finalize and navigate to the app.
      if (signUp.status === "complete" && signUp.createdSessionId) {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setError(finalizeError.message || "Failed to start session.");
          setLoading(false);
          return;
        }
        posthog?.capture("user_signed_up", {
          verification_required: false,
        });
        router.replace("/(tabs)");
        return;
      }

      // Otherwise, an email verification code is required.
      const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
      if (sendCodeError) {
        setError(sendCodeError.message || "Failed to send verification code.");
        setLoading(false);
        return;
      }

      setPhase("verify");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setError(null);
    setLoading(true);

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (verifyError) {
        setError(verifyError.message || "Invalid or expired code.");
        setLoading(false);
        return;
      }

      if (signUp.status === "complete" && signUp.createdSessionId) {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setError(finalizeError.message || "Failed to start session.");
          setLoading(false);
          return;
        }
        posthog?.capture("user_signed_up", {
          verification_required: true,
        });
        router.replace("/(tabs)");
      } else {
        setError("Sign-up could not be completed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">S</Text>
              </View>
              <View>
                <Text className="auth-wordmark">SubTrack</Text>
                <Text className="auth-wordmark-sub">Subscription Manager</Text>
              </View>
            </View>
            <Image
              source={images.splashPattern}
              className="h-40 w-40 opacity-80"
              resizeMode="contain"
            />
          </View>

          {phase === "form" ? (
            <>
              <View className="mt-10 items-center">
                <Text className="auth-title">Create your account</Text>
                <Text className="auth-subtitle">
                  Start managing your subscriptions in one place and take control of your spending.
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="flex-row gap-4">
                    <View className="auth-field flex-1">
                      <Text className="auth-label">First name</Text>
                      <TextInput
                        className="auth-input"
                        placeholder="Jane"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                        autoCapitalize="words"
                        autoCorrect={false}
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                    <View className="auth-field flex-1">
                      <Text className="auth-label">Last name</Text>
                      <TextInput
                        className="auth-input"
                        placeholder="Doe"
                        placeholderTextColor="rgba(0,0,0,0.4)"
                        autoCapitalize="words"
                        autoCorrect={false}
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="you@example.com"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      value={emailAddress}
                      onChangeText={setEmailAddress}
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className="auth-input"
                      placeholder="Create a password"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  {error ? (
                    <Text className="auth-error">{error}</Text>
                  ) : null}

                  <TouchableOpacity
                    className="auth-button"
                    onPress={onSignUpPress}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Sign Up</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/sign-in" className="auth-link">
                  Sign in
                </Link>
              </View>
            </>
          ) : (
            <>
              <View className="mt-10 items-center">
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a 6-digit code to {emailAddress}. Enter it below to finish creating your account.
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className="auth-input text-center tracking-[8px]"
                      placeholder="000000"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={code}
                      onChangeText={setCode}
                    />
                  </View>

                  {error ? (
                    <Text className="auth-error">{error}</Text>
                  ) : null}

                  <TouchableOpacity
                    className="auth-button"
                    onPress={onVerifyPress}
                    disabled={loading || code.length < 6}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="auth-secondary-button"
                    onPress={() => {
                      setPhase("form");
                      setError(null);
                    }}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text className="auth-secondary-button-text">Back to sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
