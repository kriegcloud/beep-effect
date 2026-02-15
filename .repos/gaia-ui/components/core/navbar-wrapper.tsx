import { Navbar } from "@/components/ui/navbar";
import { getNavigation } from "@/lib/navigation";

export function NavbarWrapper() {
	const navigation = getNavigation();

	return <Navbar navigation={navigation} />;
}
