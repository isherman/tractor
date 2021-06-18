import * as React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Switch, Route, Link } from "react-router-dom";
import { Overview } from "./Overview";
import { State } from "./State";
import { Root as Scope } from "./scope/Root";
import styles from "./App.module.scss";
import { Programs } from "./Programs";
import { Blobstore } from "./Blobstore";
import { Manis } from "./manis/Manis";

export const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <Navbar
        collapseOnSelect
        expand="md"
        bg="dark"
        variant="dark"
        className={styles.navbar}
      >
        <Navbar.Brand as={Link} to="/">
          farm-ng
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav>
            <Nav.Link as={Link} to="/overview">
              Overview
            </Nav.Link>
            <Nav.Link as={Link} to="/state">
              State
            </Nav.Link>
            <Nav.Link as={Link} to="/programs">
              Programs
            </Nav.Link>
            <Nav.Link as={Link} to="/scope">
              Scope
            </Nav.Link>
            <Nav.Link as={Link} to="/blobs">
              Blobs
            </Nav.Link>
            <Nav.Link as={Link} to="/manis">
              Manis
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Switch>
        <Route exact path="/" component={Overview} />
        <Route exact path="/overview" component={Overview} />
        <Route exact path="/state" component={State} />
        <Route exact path="/programs" component={Programs} />
        <Route exact path="/scope" component={Scope} />
        <Route exact path="/manis" component={Manis} />
        <Route path={["/blobs/:blobPath+", "/blobs"]} component={Blobstore} />
        <Route render={() => <p>Not found</p>} />
      </Switch>
    </div>
  );
};
