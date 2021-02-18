(() => {
  const selector = (selector) => document.getElementById(selector);
  const create = (element) => document.createElement(element);

  const app = selector("app");

  const Login = create("div");
  Login.classList.add("login");

  const Logo = create("img");
  Logo.src = "./assets/images/logo.svg";
  Logo.classList.add("logo");

  const Form = create("form");

  Form.onsubmit = async (e) => {
    e.preventDefault();
    const [email, password] = e.target;

    const { url } = await fakeAuthenticate(email.value, password.value);

    location.href = "#users";

    const users = await getDevelopersList(url);
    renderPageUsers(users);
  };

  Form.oninput = (e) => {
    const [email, password, button] = e.target.parentElement.children;
    !validateEmail(email.value) || !email.value || password.value.length <= 5
      ? button.setAttribute("disabled", "disabled")
      : button.removeAttribute("disabled");
  };

  Form.setAttribute("method", "post");
  Form.setAttribute("action", "onsubmit");

  let email = create("input");
  email.setAttribute("type", "text");
  email.setAttribute("name", "email");
  email.setAttribute("placeholder", "Entre com seu e-mail");

  let password = create("input");
  password.setAttribute("type", "password");
  password.setAttribute("name", "password");
  password.setAttribute("placeholder", "Digite sua senha supersecreta");

  let buttonSubmit = create("input");
  buttonSubmit.setAttribute("type", "submit");
  buttonSubmit.setAttribute("disabled", "");

  Form.appendChild(email);
  Form.appendChild(password);
  Form.appendChild(buttonSubmit);

  app.appendChild(Login);
  app.appendChild(Logo);
  Login.appendChild(Form);

  async function fakeAuthenticate(email, password) {
    const data = await fetch("http://www.mocky.io/v2/5dba690e3000008c00028eb6");

    const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${
      new Date().getTime() + 300000
    }`;

    if (fakeJwtToken) {
      localStorage.setItem("token", fakeJwtToken);
    }
    return data;
  }

  async function getDevelopersList(url) {
    const response = await fetch(url).then((res) => res.json());
    const data = await fetch(response.url).then((res) => res.json());

    return data;
  }

  function renderPageUsers(users) {
    app.classList.add("logged");
    Login.style.display = "none";

    const Ul = create("ul");
    Ul.classList.add("container");

    const data = users
      .map(
        (user) => `
            <li>
                <img src="${user.avatar_url}" />
            <p>${user.login}</p>
            </li>`
      )
      .join("");

    app.appendChild(Ul);

    document.querySelector(".container").innerHTML = data;
  }

  function validateEmail(email) {
    if (
      /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/.test(
        email
      )
    )
      return true;
  }

  (async function () {
    const rawToken = localStorage.getItem("token");
    const token = rawToken ? rawToken.split(".") : null;
    if (!token || token[2] < new Date().getTime()) {
      localStorage.removeItem("token");
      location.href = "#login";
      app.appendChild(Login);
    } else {
      location.href = "#users";
      const users = await getDevelopersList(atob(token[1]));
      renderPageUsers(users);
    }
  })();
})();
