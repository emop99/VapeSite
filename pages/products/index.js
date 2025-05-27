// Redirect from /products to the main page
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}

// This component won't be rendered since we're redirecting
export default function ProductsPage() {
  return null;
}