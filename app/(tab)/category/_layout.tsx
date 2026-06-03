import { Stack } from "expo-router";

const StackComponent = () => {
    return (
        <Stack screenOptions={{ title: "" }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    )
}
export default StackComponent;