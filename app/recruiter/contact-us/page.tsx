import ContactUsForm from "@/components/ContactUsForm";
import RecruiterNavbar from "@/components/RecruiterNavbar";

const ContactUsPage = () => {
  return (
    <div>
      <RecruiterNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <div className="max-w-lg mx-auto">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
