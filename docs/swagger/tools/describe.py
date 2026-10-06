#!/usr/bin/env python3
"""OpenAPI (docs/swagger/openapi.json)-оос endpoint-ийн тодорхойлолтыг уншигдахуйц хэлбэрээр гаргана.

Хэрэглээ:
  python3 docs/swagger/tools/describe.py "GET /customer/profile" "POST /user/logout" ...
  python3 docs/swagger/tools/describe.py --schema RecruitmentDto
  python3 docs/swagger/tools/describe.py --grep logout
"""
import json
import os
import sys

SPEC = os.path.join(os.path.dirname(__file__), "..", "openapi.json")
d = json.load(open(SPEC, encoding="utf-8"))
schemas = d.get("components", {}).get("schemas", {})


def ref_name(ref):
    return ref.split("/")[-1]


def type_str(s, depth=0):
    """Schema-г богино төрөл болгоно: Name, string(uuid), int64, X[], enum(A|B), nullable."""
    if s is None:
        return "?"
    if "$ref" in s:
        return ref_name(s["$ref"])
    if "allOf" in s or "oneOf" in s or "anyOf" in s:
        k = next(k for k in ("allOf", "oneOf", "anyOf") if k in s)
        return f"{k}(" + " | ".join(type_str(x, depth) for x in s[k]) + ")"
    t = s.get("type")
    if isinstance(t, list):  # OpenAPI 3.1: ["string","null"]
        nn = [x for x in t if x != "null"]
        base = type_str({**s, "type": nn[0] if nn else "null"}, depth)
        return base + ("?" if "null" in t else "")
    if t == "array":
        return type_str(s.get("items"), depth) + "[]"
    if "enum" in s:
        return "enum(" + "|".join(map(str, s["enum"])) + ")"
    fmt = s.get("format")
    if t == "object" and "additionalProperties" in s:
        return "map<string," + type_str(s["additionalProperties"], depth) + ">"
    return f"{t}({fmt})" if fmt else str(t)


def show_schema(name, indent="    ", seen=None, depth=0, max_depth=2):
    seen = seen or set()
    s = schemas.get(name)
    if s is None:
        print(f"{indent}<missing schema {name}>")
        return
    if name in seen or depth > max_depth:
        return
    seen.add(name)
    req = set(s.get("required", []))
    props = s.get("properties", {})
    if "enum" in s:
        print(f"{indent}{name} = enum({'|'.join(map(str, s['enum']))})")
        return
    print(f"{indent}{name} {{required: {sorted(req) or '—'}}}")
    for p, ps in props.items():
        extra = []
        for k in ("minLength", "maxLength", "minimum", "maximum", "pattern", "default", "minItems", "maxItems"):
            if k in ps:
                extra.append(f"{k}={ps[k]}")
        flag = "*" if p in req else " "
        print(f"{indent}  {flag} {p}: {type_str(ps)}{('  [' + ', '.join(extra) + ']') if extra else ''}")
    for p, ps in props.items():
        target = ps.get("$ref") or (ps.get("items") or {}).get("$ref")
        if target:
            show_schema(ref_name(target), indent + "    ", seen, depth + 1, max_depth)


def describe(method, path):
    op = d["paths"].get(path, {}).get(method.lower())
    if not op:
        print(f"## {method} {path}\n  ✗ Swagger-т БАЙХГҮЙ\n")
        return
    print(f"## {method} {path}   [{', '.join(op.get('tags', []))}] operationId={op.get('operationId')}")
    for prm in op.get("parameters", []):
        sch = prm.get("schema", {})
        extra = {k: sch[k] for k in ("default", "minimum", "maximum", "maxLength") if k in sch}
        print(f"  param {prm['in']}:{prm['name']} {'(required)' if prm.get('required') else '(optional)'} {type_str(sch)} {extra or ''}")
    rb = op.get("requestBody")
    if rb:
        for ct, c in rb.get("content", {}).items():
            print(f"  body {ct} {'(required)' if rb.get('required') else ''}: {type_str(c.get('schema'))}")
            r = c.get("schema", {}).get("$ref") or (c.get("schema", {}).get("items") or {}).get("$ref")
            if r:
                show_schema(ref_name(r))
    for code, resp in op.get("responses", {}).items():
        for ct, c in (resp.get("content") or {"-": {}}).items():
            print(f"  {code} {ct}: {type_str(c.get('schema'))}")
            r = (c.get("schema") or {}).get("$ref") or ((c.get("schema") or {}).get("items") or {}).get("$ref")
            if r:
                show_schema(ref_name(r))
    print()


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[:1] == ["--schema"]:
        for n in args[1:]:
            show_schema(n, max_depth=3)
    elif args[:1] == ["--grep"]:
        for p, ops in d["paths"].items():
            if any(a in p for a in args[1:]):
                print(" ".join(m.upper() for m in ops), p)
    else:
        for a in args:
            m, p = a.split(" ", 1)
            describe(m, p)
