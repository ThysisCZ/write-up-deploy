

async function Call(baseUri, useCase, dtoIn, method, token = undefined) {

    let response;

    try {
        if (!method || method === "get") {
            if (dtoIn) {
                response = await fetch(`${baseUri}/${useCase}?${new URLSearchParams(dtoIn)}`, { headers: { "Authorization": `Bearer ${token ?? localStorage.getItem("accessToken")}` } })
            } else {
                response = await fetch(`${baseUri}/${useCase}`, { headers: { "Authorization": `Bearer ${token ?? localStorage.getItem("accessToken")}` } })
            }
        } else {
            response = await fetch(`${baseUri}/${useCase}`,
                {
                    method: method.toUpperCase(),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token ?? localStorage.getItem("accessToken")}`
                    },
                    body: JSON.stringify(dtoIn)
                }
            );
        }
        let data =  {}
        if (response) {
            try {
                data = await response.json();
            } catch (e) {}
        }

        //
        if ( false && data.code == "InvalidToken" ) {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken && refreshToken !== "null") {
                console.log(refreshToken)
                const refreshTokenResult = await Call( baseUri, "user/token/refresh", undefined, "get", refreshToken )
                if (refreshTokenResult.ok) {
                    console.log(refreshTokenResult.response.accessToken)
                    localStorage.setItem("accessToken", refreshTokenResult.response.accessToken)
                }
            }
        }

        return { ok: response.ok, status: response.status, response: data };
    } catch (e) {
        console.log(e)
        return { ok: false, status: "error" }
    }

}

///TODO: replace za produkční url nebo to načítejte idalně z .env 💋
const baseUri = "https://test-be.write-up.eu/api/v1";


const FetchHelper = {
    user: {
        register: async (dtoIn) => Call(baseUri, "user/register", dtoIn, "post"),
        login: async (dtoIn) => Call(baseUri, "user/token/login", dtoIn, "post"),
        refresh: async (dtoIn, token) => Call(baseUri, "user/token/refresh", dtoIn, "get", token),
    },
    // The way the fetch helper is organised doesnt work as well for the /books requests, since they are the same route, but different request types,
    // for ease of use, the methods are named after their function, rather than the actual called request
    books: {
        list: async (dtoIn) => Call(baseUri, `books`, dtoIn, "get"),
        get: async (dtoIn, bookId) => Call(baseUri, `books/${bookId}`, dtoIn, "get"),
        create: async (dtoIn) => Call(baseUri, "books", dtoIn, "post"),
        edit: async (dtoIn, bookId) => Call(baseUri, `books/${bookId}`, dtoIn, "patch"),
        delete: async (bookId) => Call(baseUri, `books/${bookId}`, undefined, "delete"),

        chapters: {
            create: async (dtoIn, bookId) => Call(baseUri, `books/${bookId}/chapters`, dtoIn, "post"),
            get: async (dtoIn, bookId, chapterId) => Call(baseUri, `books/${bookId}/chapters/${chapterId}`, dtoIn, "get"),
            list: async (dtoIn, bookId ) => Call(baseUri, `books/${bookId}/chapters`, dtoIn, "get"),
            edit: async (dtoIn, bookId, chapterId) => Call(baseUri, `books/${bookId}/chapters/${chapterId}`, dtoIn, "patch"),
            delete: async (dtoIn, bookId, chapterId) => Call(baseUri, `books/${bookId}/chapters/${chapterId}`, dtoIn, "delete"),
        }
    },
    profile: {
        create: async (dtoIn, token) => Call(baseUri, `profile`, dtoIn, "post", token),
    }
}

export default FetchHelper;