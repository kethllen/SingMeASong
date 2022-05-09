describe("end to end", () => {
  beforeEach(() => {
    cy.request("DELETE", "http://localhost:5000/recommendations/delete");
  });
  const musics = [
    {
      name: "Eduardo e monica",
      youtubeLink: "https://www.youtube.com/watch?v=-CEMNef58J0",
    },
    {
      name: "Geracao coca-cola",
      youtubeLink: "https://www.youtube.com/watch?v=7tXCo-fl59M",
      score: 2,
    },
    {
      name: "Índios",
      youtubeLink: "https://www.youtube.com/watch?v=nM_gEzvhsM0",
      score: 10,
    },
    {
      name: "Tempo perdido",
      youtubeLink: "https://www.youtube.com/watch?v=zpzoG5KGaHg",
      score: 15,
    },
    {
      name: "Pais e filhos",
      youtubeLink: "https://www.youtube.com/watch?v=DEwLqT669Do",
      score: 12,
    },
  ];
  it("insert music valid", () => {
    const music = musics[0];

    cy.visit("http://localhost:3000/");
    cy.get('input[placeholder="Name"]').type(music.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(music.youtubeLink);

    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendations"
    );

    cy.get("button").click();

    cy.wait("@createRecommendations");

    cy.contains(music.name);
    cy.end();
  });
  it("insert body empyt music ", () => {
    cy.get("button").click();

    cy.visit("http://localhost:3000/");

    cy.on("window:alert", (text) => {
      expect(text).to.contains("Error creating recommendation!");
    });

    cy.end();
  });
  it("upvote test", () => {
    const music = musics[0];

    cy.visit("http://localhost:3000/");
    cy.get('input[placeholder="Name"]').type(music.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(music.youtubeLink);
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendations"
    );

    cy.get("button").click();

    cy.wait("@createRecommendations");

    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "0");
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("svg:first-of-type").click();
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "1");
      });
  });
  it("downvote test", () => {
    const music = musics[0];

    cy.visit("http://localhost:3000/");
    cy.get('input[placeholder="Name"]').type(music.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(music.youtubeLink);
    cy.intercept("POST", "http://localhost:5000/recommendations").as(
      "createRecommendations"
    );

    cy.get("button").click();

    cy.wait("@createRecommendations");

    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "0");
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("svg:last-of-type").click();
      });
    cy.contains(music.name)
      .get("article")
      .within(() => {
        cy.get("div:last-of-type").should("have.text", "-1");
      });
  });
  it("top", () => {
    cy.visit("http://localhost:3000/");

    cy.request("POST", "http://localhost:5000/recommendations/seed", musics);

    cy.contains("Top").click();

    cy.url().should("equal", "http://localhost:3000/top");

    cy.get("article:first-of-type").within(() => {
      cy.get("div:last-of-type").should("have.text", "15");
    });

    cy.get("article:last-of-type").within(() => {
      cy.get("div:last-of-type").should("have.text", "0");
    });
  });
  it("random", () => {
    cy.visit("http://localhost:3000/");

    cy.request("POST", "http://localhost:5000/recommendations/seed", musics);

    cy.contains("Random").click();

    cy.url().should("equal", "http://localhost:3000/random");

    cy.get("article:first-of-type").within(() => {
      cy.get("div:last-of-type").should(($div) => {
        const text = parseInt($div.text());

        expect(text).to.be.greaterThan(0);
      });
    });
  });
});
