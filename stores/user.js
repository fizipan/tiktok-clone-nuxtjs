import { defineStore } from "pinia";
import axios from "../plugins/axios";
import { useGeneralStore } from "./general";

const $axios = axios().provide.axios;

export const useUserStore = defineStore("user", {
  state: () => ({
    id: "",
    name: "",
    bio: "",
    image: "",
  }),
  actions: {
    async getTokens() {
      await $axios.get("/sanctum/csrf-cookie");
    },

    async login(email, password) {
      const token = useCookie("XSRF-TOKEN");
      await $axios.post(
        "/login",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "X-XSRF-TOKEN": token.value,
          },
        }
      );
    },

    async register(name, email, password, confirmPassword) {
      const token = useCookie("XSRF-TOKEN");
      await $axios.post(
        "/register",
        {
          name: name,
          email: email,
          password: password,
          password_confirmation: confirmPassword,
        },
        {
          headers: {
            "X-XSRF-TOKEN": token.value,
          },
        }
      );
    },

    async getUser() {
      let res = await $axios.get("/api/logged-in-user");

      this.$state.id = res.data[0].id;
      this.$state.name = res.data[0].name;
      this.$state.bio = res.data[0].bio;
      this.$state.image = res.data[0].image;
    },

    async updateUserImage(data) {
      const token = useCookie("XSRF-TOKEN");
      return await $axios.post("/api/update-user-image", data, {
        headers: {
          "X-XSRF-TOKEN": token.value,
        },
      });
    },

    async updateUser(name, bio) {
      const token = useCookie("XSRF-TOKEN");
      return await $axios.patch(
        "/api/update-user",
        {
          name: name,
          bio: bio,
        },
        {
          headers: {
            "X-XSRF-TOKEN": token.value,
          },
        }
      );
    },

    async createPost(data) {
      const token = useCookie("XSRF-TOKEN");
      return await $axios.post("/api/posts", data, {
        headers: {
          "X-XSRF-TOKEN": token.value,
        },
      });
    },

    async deletePost(post) {
      return await $axios.delete(`/api/posts/${post.id}`, {
        headers: {
          "X-XSRF-TOKEN": useCookie("XSRF-TOKEN").value,
        },
      });
    },

    async addComment(post, comment) {
      const token = useCookie("XSRF-TOKEN");
      let res = await $axios.post(
        "/api/comments",
        {
          post_id: post.id,
          comment: comment,
        },
        { headers: { "X-XSRF-TOKEN": token.value } }
      );

      if (res.status === 200) {
        await this.updateComments(post);
      }
    },

    async deleteComment(post, commentId) {
      const token = useCookie("XSRF-TOKEN");
      let res = await $axios.delete(`/api/comments/${commentId}`, {
        headers: { "X-XSRF-TOKEN": token.value },
      });

      if (res.status === 200) {
        await this.updateComments(post);
      }
    },

    async updateComments(post) {
      let res = await $axios.get(`/api/profiles/${post.user.id}`);

      for (let i = 0; i < res.data.posts.length; i++) {
        const updatePost = res.data.posts[i];

        if (post.id == updatePost.id) {
          useGeneralStore().selectedPost.comments = updatePost.comments;
        }
      }
    },

    async likePost(post, isPostPage) {
      const token = useCookie("XSRF-TOKEN");
      let res = await $axios.post(
        "/api/likes",
        {
          post_id: post.id,
        },
        {
          headers: {
            "X-XSRF-TOKEN": token.value,
          },
        }
      );

      console.log(res);

      let singlePost = null;

      if (isPostPage) {
        singlePost = post;
      } else {
        singlePost = useGeneralStore().posts.find((p) => p.id === post.id);
      }
      console.log(singlePost);
      singlePost.likes.push(res.data.like);
    },

    async unlikePost(post, isPostPage) {
      const token = useCookie("XSRF-TOKEN");
      let deleteLike = null;
      let singlePost = null;

      if (isPostPage) {
        singlePost = post;
      } else {
        singlePost = useGeneralStore().posts.find((p) => p.id === post.id);
      }

      singlePost.likes.forEach((like) => {
        if (like.user_id === this.id) {
          deleteLike = like;
        }
      });

      let res = await $axios.delete("/api/likes/" + deleteLike.id, {
        headers: {
          "X-XSRF-TOKEN": token.value,
        },
      });

      for (let i = 0; i < singlePost.likes.length; i++) {
        const like = singlePost.likes[i];
        if (like.id === res.data.like.id) {
          singlePost.likes.splice(i, 1);
        }
      }
    },

    async logout() {
      const token = useCookie("XSRF-TOKEN");
      await $axios.post(
        "/logout",
        {},
        {
          headers: {
            "X-XSRF-TOKEN": token.value,
          },
        }
      );
      this.resetUser();
    },

    resetUser() {
      this.$state.id = "";
      this.$state.name = "";
      this.$state.email = "";
      this.$state.bio = "";
      this.$state.image = "";
    },
  },
  persist: true,
});
