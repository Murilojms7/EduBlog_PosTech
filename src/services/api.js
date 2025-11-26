export async function getPosts(role) {
    try {
        const response = await fetch("http://192.168.18.153:3000/posts", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Role": role,
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar posts");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao buscar posts:", err);
        return [];
    }
}

export async function getPostById(role, id) {
    try{
        const response = await fetch(`http://192.168.18.153:3000/posts/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Role": role,
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar post");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao buscar post:", err);
        return null;
    }
}

export async function updatePost(role, id, postData) {
    try {
        const response = await fetch(`http://192.168.18.153:3000/posts/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Role": role,
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error("Erro ao atualizar post");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao atualizar post:", err);
        throw err;
    }
}

export async function createPost(role, postData) {
    try {
        const response = await fetch("http://192.168.18.153:3000/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Role": role,
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error("Erro ao criar post");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao criar post:", err);
        throw err;
    }
}

export async function deletePost(role, id) {
    try {
        const response = await fetch(`http://192.168.18.153:3000/posts/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Role": role,
            },
        });

        if (!response.ok) {
            throw new Error("Erro ao deletar post");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao deletar post:", err);
        throw err;
    }
}

export async function login(email, password) {
    try {
        const response = await fetch("http://192.168.18.153:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, password: password }),
        });

        if (!response.ok) {
            throw new Error("Erro ao fazer login");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao fazer login:", err);
        throw err;
    }
}

export async function createComment(id, commentData, role) {
    try {
        const response = await fetch(`http://192.168.18.153:3000/posts/comment/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Role": role,
            }, 
            body: JSON.stringify(commentData),
        });

        if (!response.ok) {
            throw new Error("Erro ao criar comentário");
        }

        return await response.json();
    } catch (err) {
        console.error("Erro ao criar comentário:", err);
        throw err;
    }
}