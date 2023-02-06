import Head from 'next/head';

const About = () => {
  return (
    <>
      <Head>
        <title>About us | GlobalPal Service</title>
        <meta name="description" content="About GlobalPal Service" />
      </Head>
      <div className="p-3">
        <p className="display-3">About us</p>
        <div className="text-center w-100">
          <img
            src="/pay.jpg"
            alt="about ..."
            style={{ height: '250px' }}
            className="rounded-pill"
          />
        </div>
        <h4>Shipping from USA to Ukraine</h4>
        <div className="p-3">
          GlobalPal Service delivers parcels to Ukraine by sea and by air to the
          address of the recipient. We are still shipping packages to
          residential addresses in Ukraine during the war, with some delivery
          limitations due to active military conflict. In order to make shipping
          parcels easier for our customers, we have created a Meest Portal. Our
          portal is a website we developed to elevate your customer experience
          by offering a variety of user-friendly amenities. If you register, you
          can start enjoying these time-saving benefits: Estimate shipping
          costs. Fill in shipping information, and CN23 customs forms – all
          online. Locate nearest Meest agent or FedEx drop-off location. Examine
          shipped packages information. Review payment history. Create a
          database for your regular recipient shipments.
        </div>
      </div>
    </>
  );
};

export default About;
