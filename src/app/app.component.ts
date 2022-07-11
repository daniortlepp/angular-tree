import { Component, OnInit, ViewChild } from '@angular/core';
import { TreeComponent, TreeNode, TREE_ACTIONS, KEYS } from '@circlon/angular-tree-component'
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap'; 

import { NodesService } from './services/nodes.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  @ViewChild(TreeComponent)
  tree: TreeComponent;

  closeModal: string;
  nodes: any;
  options: any;
  selectedNode: any;
  form: FormGroup;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private nodesService: NodesService) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: null
    });

    if (!localStorage.getItem('nodes')) {
      localStorage.setItem('nodes', JSON.stringify([{id: 1, name: 'Árvore de itens'}]));
    }
    this.nodes = JSON.parse(localStorage.getItem('nodes')!);

    this.options = {
      actionMapping: {
        mouse: {
          dblClick: (tree, node, $event) => {
            if (node.hasChildren) {
              TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
            }
          },
          click: (tree, node, $event) => {
            $event.shiftKey
              ? TREE_ACTIONS.TOGGLE_ACTIVE_MULTI(tree, node, $event)
              : TREE_ACTIONS.TOGGLE_ACTIVE(tree, node, $event);
          }
        }
      },
      allowDrag: true
    };

  }

  ngAfterViewInit() {
    this.tree.treeModel.expandAll();
  }

  onActivateNode(event) {
    this.selectedNode = event.node.data;
  }

  openModal(content, node) {
    this.modalService.open(content).result.then((result) => {
      if (result == 'save') {
        this.addNode(node);
      }
    });
  }

  addNode(node) {
    this.nodesService.addNode(node, this.tree, this.form.value.name);
    this.form.reset();
    localStorage.setItem('nodes', JSON.stringify(this.nodes));
  }

  deleteNode(node, tree) {
    this.nodesService.deleteNode(node, tree, this.selectedNode);
    localStorage.setItem('nodes', JSON.stringify(this.nodes));
  }

  checked(node, $event) {
    this.updateChildNodesCheckBox(node, $event.target.checked);
    this.updateParentNodesCheckBox(node.parent);
  }

  updateChildNodesCheckBox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => this.updateChildNodesCheckBox(child, checked));
    }
  }

  updateParentNodesCheckBox(node) {
    if (node && node.level > 0 && node.children) {
      let allChildChecked = true;
      let noChildChecked = true;
      for (let child of node.children) {
        if (!child.data.checked) {
          allChildChecked = false;
        } else if (child.data.checked) {
          noChildChecked = false;
        }
      }
      if (allChildChecked) {
        node.data.checked = true;
        node.data.indeterminate = false;
      } else if (noChildChecked) {
        node.data.checked = false;
        node.data.indeterminate = false;
      } else {
        node.data.checked = true;
        node.data.indeterminate = true;
      }
      this.updateParentNodesCheckBox(node.parent);
    }
  }

}
