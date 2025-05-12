// Bible Chat Edge Function

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      status: 200,
    });
  }

  try {
    const { message } = await req.json();

    // Simple response generation logic
    // In a production environment, you would connect to an actual AI service like OpenAI here
    const response = generateBibleResponse(message);

    const data = {
      text: response,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});

// Simple function to generate Bible-related responses
// This would be replaced with an actual AI service call in production
function generateBibleResponse(message: string): string {
  const lowercaseMessage = message.toLowerCase();

  if (
    lowercaseMessage.includes("genesis") ||
    lowercaseMessage.includes("creation")
  ) {
    return "Genesis is the first book of the Bible. It begins with the story of creation: 'In the beginning God created the heavens and the earth.'";
  } else if (
    lowercaseMessage.includes("jesus") ||
    lowercaseMessage.includes("christ")
  ) {
    return "Jesus Christ is the central figure of Christianity. The New Testament records his birth, ministry, death, and resurrection.";
  } else if (
    lowercaseMessage.includes("commandment") ||
    lowercaseMessage.includes("commandments")
  ) {
    return "The Ten Commandments are a set of biblical principles relating to ethics and worship. They include commands to worship only God, honor one's parents, and prohibitions against idolatry, blasphemy, murder, theft, dishonesty, and adultery.";
  } else if (
    lowercaseMessage.includes("psalm") ||
    lowercaseMessage.includes("psalms")
  ) {
    return "The Book of Psalms is a collection of religious songs and prayers. Psalm 23 is one of the most well-known: 'The Lord is my shepherd; I shall not want.'";
  } else {
    return `Thank you for your question about "${message}". In a complete implementation, this would connect to a more sophisticated AI service that could provide detailed biblical insights and references.`;
  }
}
